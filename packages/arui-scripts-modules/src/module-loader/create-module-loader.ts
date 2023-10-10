import { cleanGlobal } from './utils/clean-global';
import { ConsumersCounter } from './utils/consumers-counter';
import { removeModuleResources } from './utils/dom-utils';
import { getCompatModule, getModule } from './utils/get-module';
import { mountModuleResources } from './utils/mount-module-resources';
import { BaseModuleState, GetResourcesRequest, Loader, ModuleResources } from './types';

export type ModuleResourcesGetter<GetResourcesParams, ModuleState extends BaseModuleState> = (
    params: GetResourcesRequest<GetResourcesParams>,
) => Promise<ModuleResources<ModuleState>>;
export type ModuleLoaderHook<ModuleState extends BaseModuleState = BaseModuleState> = (
    moduleId: string,
    resources: ModuleResources<ModuleState>,
) => Promise<void> | void;
export type ModuleLoaderHookWithModule<ModuleExportType, ModuleState extends BaseModuleState = BaseModuleState> = (
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
};

export function createModuleLoader<
    ModuleExportType,
    GetResourcesParams = undefined,
    ModuleState extends BaseModuleState = BaseModuleState,
>({
    moduleId,
    hostAppId,
    getModuleResources,
    resourcesTargetNode,
    onBeforeResourcesMount,
    onBeforeModuleMount,
    onAfterModuleMount,
    onBeforeModuleUnmount,
    onAfterModuleUnmount,
}: CreateModuleLoaderParams<ModuleExportType, GetResourcesParams, ModuleState>): Loader<
    GetResourcesParams,
    ModuleExportType
> {
    validateUsedWebpackVersion();

    const moduleConsumersCounter = new ConsumersCounter(moduleId);

    return async ({ cssTargetSelector, getResourcesParams}) => {
        // Загружаем описание модуля
        const moduleResources = await getModuleResources({
            moduleId,
            hostAppId,
            params: getResourcesParams as any, // для того чтобы пользователям не пришлось передавать этот параметр если он им не нужен, мы обвешиваемся type-cast'ом
        });

        await onBeforeResourcesMount?.(moduleId, moduleResources);

        const resourcesNodes = await mountModuleResources({
            resourcesTargetNode,
            cssTargetSelector,
            moduleConsumersCounter,
            moduleId,
            scripts: moduleResources.scripts,
            styles: moduleResources.styles,
            baseUrl: moduleResources.moduleState.baseUrl,
        });

        // увеличиваем счетчик потребителей только после добавления скриптов и стилей
        moduleConsumersCounter.increase();

        await onBeforeModuleMount?.(moduleId, moduleResources);

        // В зависимости от типа модуля, получаем его контент необходимым способом
        const loadedModule =
            moduleResources.mountMode === 'default'
                ? await getModule<ModuleExportType>(moduleResources.appName, moduleId)
                : getCompatModule<ModuleExportType>(moduleId);

        if (!loadedModule) {
            throw new Error(`Module ${ moduleId } is not available`);
        }

        await onAfterModuleMount?.(moduleId, moduleResources, loadedModule);

        return {
            unmount: () => {
                moduleConsumersCounter.decrease();

                onBeforeModuleUnmount?.(moduleId, moduleResources, loadedModule);

                if (moduleConsumersCounter.isAbsent()) {
                    // Если на странице больше нет потребителей модуля, то удаляем его ресурсы - скрипты, стили и глобальные переменные
                    removeModuleResources({
                        moduleId,
                        targetNodes: resourcesNodes,
                    });
                    cleanGlobal(moduleId);
                }

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
        typeof (window as any).webpackJsonp !== 'undefined' &&
        process.env.NODE_ENV !== 'production'
    ) {
        console.warn(
            'Если вы хотите использовать модули - вам надо обновиться до webpack 5/arui-scripts 12.' +
                'в противном случае вы можете получить совершенно неожиданные ошибки',
        );
    }
}
