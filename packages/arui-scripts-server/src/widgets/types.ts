import type { BaseMountMode, GetResourcesRequest, GetResourcesResponse, BaseModuleParams } from '@arui-scripts/widgets';

type WidgetDescriptorBase = {
    version?: string;
    getRunParams: (getResourcesRequest: GetResourcesRequest, frameworkRequest: unknown) => Promise<BaseModuleParams>;
}

export type WidgetDescriptorLegacy = WidgetDescriptorBase & {
    mountMode: 'legacy';
    mountFunctionName: string;
    unmountFunctionName?: string;
};

export type WidgetDescriptorMF = WidgetDescriptorBase & {
    mountMode: 'mf';
};

export type WidgetsConfig = {
    [moduleId: string]: WidgetDescriptorLegacy | WidgetDescriptorMF;
};

/**
 * Базовый тип конфигурации getResources плагина
 */
export type GetResourcesPluginConfig<
    Req extends GetResourcesRequest,
    Res extends GetResourcesResponse,
> = {
    /**
     * Функция, которая должна возвращать имя mount функции для модуля
     * @param moduleId
     */
    getMountFunctionName: (moduleId: string) => string | undefined;
    /**
     * Функция, которая должна возвращать имя unmount функции для модуля
     * @param moduleId
     */
    getUnmountFunctionName: (moduleId: string) => string | undefined;
    /**
     * Функция, которая должна возвращать имена чанков, относящихся к модулю.
     * Последовательность, в которой возращаются имена чанков может быть важна, например vendor файл как правило должен идти перед main
     * При использовании mf режима можно не использовать эту функцию.
     * @param moduleId
     */
    getChunkNames?: (moduleId: string) => string[];
    /**
     * Функция, которая должна возвращать режим подключения модуля
     * @param moduleId
     */
    getMountMode: (moduleId: string) => BaseMountMode;
    /**
     * Опциональная функция, которая должна возвращать строку с версией модуля. Если не передана - будет использоваться 'unknown'
     * @param moduleId
     */
    getModuleVersion?: (moduleId: string) => string;
    /**
     * Функция, которая должна возвращать run-параметры для модуля
     * @param moduleId
     * @param request
     * @param params
     */
    getModuleRunParams: (
        moduleId: string,
        request: Request,
        params: Req['params'],
    ) => Promise<Res['moduleRunParams']>;
};
