import { cleanGlobal } from './utils/clean-global';
import { getConsumerCounter } from './utils/consumers-counter';
import { removeModuleResources } from './utils/dom-utils';
import { fetchResources, getResourcesTargetNodes } from './utils/fetch-resources';
import { getCompatModule, getModule } from './utils/get-module';
import { addCleanupMethod, cleanupModule, getModulesCache } from './utils/modules-cache';
import {
    type BaseModuleState,
    type GetResourcesRequest,
    type Loader,
    type ModuleResources,
} from './types';

export type ModuleResourcesGetter<GetResourcesParams, ModuleState extends BaseModuleState> = (
    params: GetResourcesRequest<GetResourcesParams>,
) => Promise<ModuleResources<ModuleState>>;
export type ModuleLoaderHook<ModuleState extends BaseModuleState = BaseModuleState> = (
    moduleId: string,
    resources: ModuleResources<ModuleState>,
) => Promise<void> | void;
export type ModuleLoaderHookWithModule<
    ModuleExportType,
    ModuleState extends BaseModuleState = BaseModuleState,
> = (
    moduleId: string,
    resources: ModuleResources<ModuleState>,
    module: ModuleExportType,
) => Promise<void> | void;

export type CreateModuleLoaderParams<
    // Тип экспорта модуля
    ModuleExportType,
    // Тип параметров, которые передаются в функцию получения ресурсов модуля
    GetResourcesParams,
    // Тип "состояния" модуля, который возвращается из функции получения ресурсов модуля
    ModuleState extends BaseModuleState = BaseModuleState,
> = {
    /** id загружаемого модуля */
    moduleId: string;
    /** id приложения-хоста */
    hostAppId: string;
    /** функция, которая возвращает ресурсы модуля */
    getModuleResources: ModuleResourcesGetter<GetResourcesParams, ModuleState>;
    /** Опциональная html-нода, в которую будут подключаться ресурсы модуля. По-умолчанию `document.head` */
    resourcesTargetNode?: HTMLElement;
    /** хук, вызываемый перед подключением ресурсов модуля на страницу */
    onBeforeResourcesMount?: ModuleLoaderHook<ModuleState>;
    /** хук, вызываемый после подключения ресурсов, но до получения контента модуля */
    onBeforeModuleMount?: ModuleLoaderHook<ModuleState>;
    /** хук, вызываемый после того, как модуль был получен */
    onAfterModuleMount?: ModuleLoaderHookWithModule<ModuleExportType, ModuleState>;
    /** хук, вызываемый перед удалением ресурсов модуля со страницы */
    onBeforeModuleUnmount?: ModuleLoaderHookWithModule<ModuleExportType, ModuleState>;
    /** хук, вызываем после удаления ресурсов модуля со страницы */
    onAfterModuleUnmount?: ModuleLoaderHookWithModule<ModuleExportType, ModuleState>;
    /** политика кеширования ресурсов модуля. Если 'none' - ресурсы модуля будут удалены из кеша после его удаления со страницы. Если 'single-item' - в кеше будет храниться значения для текущего значения loaderParams. */
    resourcesCache?: 'none' | 'single-item';
    /** shareScope модуля, если отличается от default */
    shareScope?: string;
    /** флаг, отключающий встраивание inline стилей в Safari */
    disableInlineStyleSafari?: boolean;
};

const consumerCounter = getConsumerCounter();

export function createModuleLoader<
    ModuleExportType,
    GetResourcesParams = undefined,
    ModuleState extends BaseModuleState = BaseModuleState,
>({
    moduleId,
    hostAppId,
    getModuleResources,
    resourcesTargetNode,
    resourcesCache = 'none',
    onBeforeResourcesMount,
    onBeforeModuleMount,
    onAfterModuleMount,
    onBeforeModuleUnmount,
    onAfterModuleUnmount,
    shareScope,
    disableInlineStyleSafari,
}: CreateModuleLoaderParams<ModuleExportType, GetResourcesParams, ModuleState>): Loader<
    GetResourcesParams,
    ModuleExportType
> {
    validateUsedWebpackVersion();

    const modulesCache = getModulesCache();

    async function getModuleResourcesWithCache(getResourcesParams: GetResourcesParams) {
        const paramsSerialized = JSON.stringify(getResourcesParams);

        if (resourcesCache === 'single-item' && modulesCache[moduleId]?.[paramsSerialized]) {
            return modulesCache[moduleId][paramsSerialized] as ModuleResources<ModuleState>;
        }

        // Если мы делаем запрос - значит либо данные не закешированы, либо в кеши лежат данные не для тех параметров.
        // В любом случае нам надо удалить ресурсы и почистить глобальные переменные
        cleanupModule(moduleId);

        const resources = await getModuleResources({
            moduleId,
            hostAppId,
            params: getResourcesParams,
        });

        if (resourcesCache === 'single-item') {
            // Добавляем результаты загрузки в кеш если кеширование включено
            if (!modulesCache[moduleId]) {
                modulesCache[moduleId] = {};
            }
            modulesCache[moduleId][paramsSerialized] = resources;
        }

        return resources;
    }

    return async ({ abortSignal, getResourcesParams, cssTargetSelector, useShadowDom } = {}) => {
        if (useShadowDom && resourcesCache === 'single-item') {
            throw new Error(
                'Загрузка модулей в shadow DOM при использовании `resourceCache: single-item` не поддерживается.',
            );
        }
        // Если во время загрузки модуля пришел сигнал об отмене, то отменяем загрузку
        if (abortSignal?.aborted) {
            throw new Error(`Module ${moduleId} loading was aborted`);
        }

        abortSignal?.addEventListener('abort', () => {
            moduleUnmount();
        });

        consumerCounter.increase(moduleId);

        const resourcesNodes = getResourcesTargetNodes({
            resourcesTargetNode,
            cssTargetSelector,
        });

        function moduleUnmount() {
            consumerCounter.decrease(moduleId);

            function cleanup() {
                removeModuleResources({
                    moduleId,
                    targetNodes: [resourcesNodes.js, resourcesNodes.css],
                });
                cleanGlobal(moduleId);
            }

            if (resourcesCache === 'single-item') {
                // если включено кеширование - мы не удаляем ресурсы модуля, но запоминаем как удалить этот модуль
                addCleanupMethod(moduleId, cleanup);

                return;
            }

            if (consumerCounter.getCounter(moduleId) === 0) {
                // Если на странице больше нет потребителей модуля, то удаляем его ресурсы - скрипты, стили и глобальные переменные
                cleanup();
            }
        }

        const isModuleResourcesCached =
            resourcesCache === 'single-item' &&
            modulesCache[moduleId]?.[JSON.stringify(getResourcesParams)];

        // Загружаем описание модуля
        const moduleResources = await getModuleResourcesWithCache(
            getResourcesParams as GetResourcesParams,
        );

        if (!isModuleResourcesCached) {
            await onBeforeResourcesMount?.(moduleId, moduleResources);

            await fetchResources({
                cssTargetNode: resourcesNodes.css,
                jsTargetNode: resourcesNodes.js,
                cssTargetSelector,
                moduleId,
                scripts: moduleResources.scripts,
                styles: moduleResources.styles,
                baseUrl: moduleResources.moduleState.baseUrl,
                abortSignal,
                disableInlineStyleSafari,
            });
        }

        await onBeforeModuleMount?.(moduleId, moduleResources);

        // В зависимости от типа модуля, получаем его контент необходимым способом
        const loadedModule =
            moduleResources.mountMode === 'default'
                ? await getModule<ModuleExportType>(moduleResources.appName, moduleId, shareScope)
                : getCompatModule<ModuleExportType>(moduleId);

        if (!loadedModule) {
            throw new Error(`Module ${moduleId} is not available`);
        }

        await onAfterModuleMount?.(moduleId, moduleResources, loadedModule);

        return {
            unmount: () => {
                onBeforeModuleUnmount?.(moduleId, moduleResources, loadedModule);
                moduleUnmount();
                onAfterModuleUnmount?.(moduleId, moduleResources, loadedModule);
            },
            module: loadedModule,
            moduleResources,
        };
    };
}

function validateUsedWebpackVersion() {
    if (
        typeof window !== 'undefined' &&
        typeof (window as typeof window & Record<string, unknown>).webpackJsonp !== 'undefined' &&
        process.env.NODE_ENV !== 'production'
    ) {
        // eslint-disable-next-line no-console
        console.warn(
            'Если вы хотите использовать модули - вам надо обновиться до webpack 5/arui-scripts 12.' +
                'в противном случае вы можете получить совершенно неожиданные ошибки',
        );
    }
}
