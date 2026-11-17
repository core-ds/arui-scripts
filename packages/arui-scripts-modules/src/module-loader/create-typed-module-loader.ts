import { createModuleLoader, type CreateModuleLoaderParams } from './create-module-loader';
import { type BaseModuleState } from './types';

// typeScript проверяет moduleId по контракту и подставляет тип модуля
export function createTypedModuleLoader<Contracts>() {
    return function createLoader<
        Id extends Extract<keyof Contracts, string>,
        GetResourcesParams = undefined,
        ModuleState extends BaseModuleState = BaseModuleState,
    >(
        params: Omit<
            CreateModuleLoaderParams<Contracts[Id], GetResourcesParams, ModuleState>,
            'moduleId'
        > & { moduleId: Id },
    ) {
        return createModuleLoader<Contracts[Id], GetResourcesParams, ModuleState>(params);
    };
}
