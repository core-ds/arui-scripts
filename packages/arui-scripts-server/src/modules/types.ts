import type { MountMode, GetResourcesRequest, GetResourcesResponse, BaseModuleParams } from '@alfalab/scripts-modules';

export type ModuleDescriptor<FrameworkParams extends unknown[] = []> = {
    mountMode: MountMode;
    version?: string;
    getRunParams: (getResourcesRequest: GetResourcesRequest, ...params: FrameworkParams) => Promise<BaseModuleParams>;
}

export type ModulesConfig<FrameworkParams extends unknown[] = []> = {
    [moduleId: string]: ModuleDescriptor<FrameworkParams>;
};

/**
 * Базовый тип конфигурации getResources плагина
 */
export type GetResourcesPluginConfig<
    Req extends GetResourcesRequest,
    Res extends GetResourcesResponse,
> = {
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
    getMountMode: (moduleId: string) => MountMode;
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
