import { BaseModuleState, GetResourcesRequest, Loader, LoaderParams, ModuleResources } from './types';
import { removeModuleResources, scriptsFetcher, stylesFetcher } from './utils/dom-utils';
import { ConsumersCounter } from './utils/consumers-counter';
import { getEmbeddedModule, getMfModule } from './utils/get-module';
import { cleanGlobal } from './utils/clean-global';

export type ModuleResourcesGetter<GetResourcesParams, ModuleState extends BaseModuleState> = (params: GetResourcesRequest<GetResourcesParams>) => Promise<ModuleResources<ModuleState>>;
export type ModuleLoaderHook = (moduleId: string, resources: ModuleResources) => Promise<void> | void;
export type ModuleLoaderHookWithModule<ModuleExportType> = (moduleId: string, resources: ModuleResources, module: ModuleExportType) => Promise<void> | void;

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
    onBeforeResourcesMount?: ModuleLoaderHook;
    /** хук, вызываемый после подключения ресурсов, но до получения контента модуля */
    onBeforeModuleMount?: ModuleLoaderHook;
    /** хук, вызываемый после того, как модуль был получен */
    onAfterModuleMount?: ModuleLoaderHookWithModule<ModuleExportType>;
    /** хук, вызываемый перед удалением ресурсов модуля со страницы */
    onBeforeModuleUnmount?: ModuleLoaderHookWithModule<ModuleExportType>;
    /** хук, вызываем после удаления ресурсов модуля со страницы*/
    onAfterModuleUnmount?: ModuleLoaderHookWithModule<ModuleExportType>;
};

export function createModuleLoader<ModuleExportType, GetResourcesParams = undefined, ModuleState extends BaseModuleState = BaseModuleState>({
    moduleId,
    hostAppId,
    getModuleResources,
    resourcesTargetNode,
    onBeforeResourcesMount,
    onBeforeModuleMount,
    onAfterModuleMount,
    onBeforeModuleUnmount,
    onAfterModuleUnmount,
}: CreateModuleLoaderParams<ModuleExportType, GetResourcesParams, ModuleState>): Loader<GetResourcesParams, ModuleExportType> {
    validateUsedWebpackVersion();

    const moduleConsumersCounter = new ConsumersCounter(moduleId);

    return async (params) => {
        resourcesTargetNode = resourcesTargetNode || document.head; // определяем дефолт тут, а не в сигнатуре функции, чтобы не было проблем с при импорте модуля в nodejs
        // Загружаем описание модуля
        const moduleResources = await getModuleResources({
            moduleId,
            hostAppId,
            params: (params as LoaderParams<unknown>).getResourcesParams as any // для того чтобы пользователям не пришлось передавать этот параметр если он им не нужен, мы обвешиваемся type-cast'ом
        });

        await onBeforeResourcesMount?.(moduleId, moduleResources);

        // Подключаем ресурсы модуля на страницу
        await Promise.all([
            moduleConsumersCounter.isAbsent()
                ? scriptsFetcher({
                    moduleId,
                    urls: moduleResources.scripts,
                    baseUrl: moduleResources.moduleState.baseUrl,
                    targetNode: resourcesTargetNode,
                })
                : Promise.resolve(),
            moduleConsumersCounter.isAbsent()
                ? stylesFetcher({
                    moduleId,
                    urls: moduleResources.styles,
                    baseUrl: moduleResources.moduleState.baseUrl,
                    targetNode: resourcesTargetNode,
                })
                : Promise.resolve(),
        ]);

        // увеличиваем счетчик потребителей только после добавления скриптов и стилей
        moduleConsumersCounter.increase();

        await onBeforeModuleMount?.(moduleId, moduleResources);

        // В зависимости от типа модуля, получаем его контент необходимым способом
        const loadedModule = moduleResources.mountMode === 'mf'
            ? await getMfModule<ModuleExportType>(moduleResources.appName, moduleId)
            : getEmbeddedModule<ModuleExportType>(moduleId);

        if (!loadedModule) {
            throw new Error(
                `Module ${moduleId} is not available`,
            );
        }

        await onAfterModuleMount?.(moduleId, moduleResources, loadedModule);

        return {
            unmount: () => {
                moduleConsumersCounter.decrease();

                onBeforeModuleUnmount?.(moduleId, moduleResources, loadedModule);

                if (moduleConsumersCounter.isAbsent()) {
                    // Если на странице больше нет потребителей модуля, то удаляем его ресурсы - скрипты, стили и глобальные переменные
                    removeModuleResources({ moduleId: moduleId, targetNode: resourcesTargetNode || document.head });
                    cleanGlobal(moduleId);
                }

                onAfterModuleUnmount?.(moduleId, moduleResources, loadedModule);
            },
            module: loadedModule,
            moduleResources: moduleResources,
        };
    };
}

function validateUsedWebpackVersion() {
    if (typeof (window as any).webpackJsonp !== 'undefined' && process.env.NODE_ENV !== 'production') {
        console.warn('Если вы хотите использовать модули - вам надо обновиться до webpack 5/arui-scripts 12.' +
            'в противном случае вы можете получить совершенно неожиданные ошибки');
    }
}
