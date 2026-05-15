import { cleanGlobal } from './utils/clean-global';
import { getConsumerCounter } from './utils/consumers-counter';
import { removeModuleResources } from './utils/dom-utils';
import { fetchResources, getResourcesTargetNodes } from './utils/fetch-resources';
import { getCompatModule, getModule } from './utils/get-module';
import { addCleanupMethod, cleanupModule, getModulesCache } from './utils/modules-cache';
import { type MountableModule } from './module-types';
import {
    type BaseModuleState,
    type GetResourcesRequest,
    type Loader,
    type ModuleResources,
} from './types';

export type ModuleResourcesGetter<
    GetResourcesParams,
    ModuleState extends BaseModuleState = BaseModuleState,
> = (params: GetResourcesRequest<GetResourcesParams>) => Promise<ModuleResources<ModuleState>>;
export type ModuleLoaderSimpleHook = (moduleId: string) => void;
export type ModuleLoaderMountHook = (moduleId: string, targetNode: HTMLElement) => void;
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
export type ModuleLoaderLoadingStage = 'fetch-manifest' | 'fetch-resources' | 'mount';
export type ModuleLoaderErrorHook = (
    moduleId: string,
    stage: ModuleLoaderLoadingStage,
    error: unknown,
) => void;

export type LifecycleHooks<ModuleExportType, ModuleState extends BaseModuleState> = {
    /** хук, вызываемый в самом начале загрузки, до любых других событий */
    onStart?: ModuleLoaderSimpleHook;
    /** хук, вызываемый перед подключением ресурсов модуля на страницу */
    onBeforeResourcesMount?: ModuleLoaderHook<ModuleState>;
    /** хук, вызываемый после подключения ресурсов, но до получения контента модуля */
    onBeforeModuleMount?: ModuleLoaderHook<ModuleState>;
    /** хук, вызываемый после того, как модуль был получен */
    onAfterModuleMount?: ModuleLoaderHookWithModule<ModuleExportType, ModuleState>;
    /** хук для монтируемых модулей, будет вызван перед запуском функции mount модуля */
    onBeforeMountableModuleMount?: ModuleLoaderMountHook;
    /** хук для монтируемых модулей, будет вызван после выполнения функции mount модуля */
    onAfterMountableModuleMount?: ModuleLoaderMountHook;
    /** хук, вызываемый перед удалением ресурсов модуля со страницы */
    onBeforeModuleUnmount?: ModuleLoaderHookWithModule<ModuleExportType, ModuleState>;
    /** хук, вызываем после удаления ресурсов модуля со страницы */
    onAfterModuleUnmount?: ModuleLoaderHookWithModule<ModuleExportType, ModuleState>;
    /** хук, вызываемый при ошибках во время загрузки или монтирования модуля */
    onError?: ModuleLoaderErrorHook;
};

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
    /** политика кеширования ресурсов модуля. Если 'none' - ресурсы модуля будут удалены из кеша после его удаления со страницы. Если 'single-item' - в кеше будет храниться значения для текущего значения loaderParams. */
    resourcesCache?: 'none' | 'single-item';
    /** shareScope модуля, если отличается от default */
    shareScope?: string;
    /** флаг, отключающий встраивание inline стилей в Safari */
    disableInlineStyleSafari?: boolean;
    /** lifecycle хуки загрузчика. Могут использоваться для модификации поведения или сбора метрик */
    hooks?: LifecycleHooks<ModuleExportType, ModuleState>;
} & LifecycleHooks<ModuleExportType, ModuleState>;

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
    shareScope,
    disableInlineStyleSafari,
    hooks,
    ...deprecatedHooks
}: CreateModuleLoaderParams<ModuleExportType, GetResourcesParams, ModuleState>): Loader<
    GetResourcesParams,
    ModuleExportType
> {
    const lifecycleHooks = hooks || deprecatedHooks;

    if (Object.keys(deprecatedHooks).length > 0 && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console -- полезный deprecation warning для команд
        console.warn(
            `Загрузчик для ${moduleId} использует устаревших формат хуков. Передавайте их как отдельный объект hooks в параметрах загрузчика`,
        );
    }

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
        if (abortSignal?.aborted) {
            throw new Error(`Module ${moduleId} loading was aborted`);
        }

        consumerCounter.increase(moduleId);
        const resourcesNodes = getResourcesTargetNodes({ resourcesTargetNode, cssTargetSelector });
        const unmount = createUnmountHandler(moduleId, resourcesNodes, resourcesCache);

        abortSignal?.addEventListener('abort', unmount);

        const isModuleResourcesCached =
            resourcesCache === 'single-item' &&
            modulesCache[moduleId]?.[JSON.stringify(getResourcesParams)];

        lifecycleHooks.onStart?.(moduleId);

        const moduleResources = await getModuleResourcesWithCache(
            getResourcesParams as GetResourcesParams,
        ).catch((error) => {
            lifecycleHooks.onError?.(moduleId, 'fetch-manifest', error);
            throw error;
        });

        if (!isModuleResourcesCached) {
            await lifecycleHooks.onBeforeResourcesMount?.(moduleId, moduleResources);

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
            }).catch((error) => {
                lifecycleHooks.onError?.(moduleId, 'fetch-resources', error);
                throw error;
            });
        }

        await lifecycleHooks.onBeforeModuleMount?.(moduleId, moduleResources);

        let loadedModule =
            moduleResources.mountMode === 'default'
                ? await getModule<ModuleExportType>(moduleResources.appName, moduleId, shareScope)
                : getCompatModule<ModuleExportType>(moduleId);

        if (!loadedModule) {
            throw new Error(`Module ${moduleId} is not available`);
        }

        if (isMountableModule(loadedModule)) {
            loadedModule = wrapMountWithHooks(loadedModule, moduleId, lifecycleHooks);
        }

        await lifecycleHooks.onAfterModuleMount?.(moduleId, moduleResources, loadedModule);

        return {
            unmount: () => {
                lifecycleHooks.onBeforeModuleUnmount?.(moduleId, moduleResources, loadedModule);
                unmount();
                lifecycleHooks.onAfterModuleUnmount?.(moduleId, moduleResources, loadedModule);
            },
            module: loadedModule,
            moduleResources,
        };
    };
}

function createUnmountHandler(
    moduleId: string,
    resourcesNodes: ReturnType<typeof getResourcesTargetNodes>,
    resourcesCache: 'none' | 'single-item',
): () => void {
    return function unmount() {
        consumerCounter.decrease(moduleId);

        const cleanup = () => {
            removeModuleResources({
                moduleId,
                targetNodes: [resourcesNodes.js, resourcesNodes.css],
            });
            cleanGlobal(moduleId);
        };

        if (resourcesCache === 'single-item') {
            // если включено кеширование - мы не удаляем ресурсы модуля, но запоминаем как удалить этот модуль
            addCleanupMethod(moduleId, cleanup);

            return;
        }

        if (consumerCounter.getCounter(moduleId) === 0) {
            cleanup();
        }
    };
}

function wrapMountWithHooks<ModuleType extends MountableModule>(
    module: ModuleType,
    moduleId: string,
    hooks: {
        onBeforeMountableModuleMount?: ModuleLoaderMountHook;
        onAfterMountableModuleMount?: ModuleLoaderMountHook;
        onError?: ModuleLoaderErrorHook;
    },
): ModuleType {
    return {
        ...module,
        mount: (...args) => {
            hooks.onBeforeMountableModuleMount?.(moduleId, args[0]);
            try {
                const result = module.mount(...args);

                hooks.onAfterMountableModuleMount?.(moduleId, args[0]);

                return result;
            } catch (error) {
                hooks.onError?.(moduleId, 'mount', error);
                throw error;
            }
        },
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMountableModule(module: any): module is MountableModule {
    return (
        module?.mount &&
        typeof module.mount === 'function' &&
        module?.unmount &&
        typeof module.unmount === 'function'
    );
}
