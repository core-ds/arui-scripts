import { unwrapDefaultExport } from './utils/unwrap-default-export';
import { type FactoryModule } from './module-types';
import { type BaseModuleState } from './types';

export async function executeModuleFactory<
    ModuleExportType,
    RunParams = undefined,
    ServerState extends BaseModuleState = BaseModuleState,
>(
    module: FactoryModule<ModuleExportType, RunParams, ServerState>,
    serverState: ServerState,
    runParams?: RunParams,
): Promise<ModuleExportType> {
    /**
     * Делаем 3 возможных варианта доставки фабрики:
     * Для compat модулей фабрику можно записать прямо в window
     * Для compat и для mf модулей делаем также возможным записи в поля factory и default
     */
    const unwrappedModule = unwrapDefaultExport(module);

    if (typeof unwrappedModule === 'function') {
        return unwrappedModule(runParams as RunParams, serverState);
    }

    if (unwrappedModule.factory && typeof unwrappedModule.factory === 'function') {
        return unwrappedModule.factory(runParams as RunParams, serverState);
    }

    /**
     * При использовании в модуле createMountableFunction из '@corp-front/module-loader' (для сохранения обратной совместимости)
     * функция пишется в поле mount
     */
    if (unwrappedModule.mount && typeof unwrappedModule.mount === 'function') {
        return unwrappedModule.mount(runParams as RunParams, serverState);
    }

    throw new Error(
        `Module ${serverState.hostAppId} does not present a factory function,
                try using another hook, e.g. 'useModuleLoader' or 'useModuleMounter'`,
    );
}
