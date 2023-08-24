import { useEffect, useState } from 'react';
import { BaseModuleState, Loader } from '../types';
import { FactoryModule } from '../module-types';
import { LoadingState } from './types';
import { unwrapDefaultExport } from '../utils/unwrap-default-export';

export type UseModuleFactoryParams<
    LoaderParams,
    ServerState extends BaseModuleState,
    ModuleExportType = any,
    RunParams = void,
> = {
    /**
     * Загрузчик модуля
     */
    loader: Loader<LoaderParams, FactoryModule<ModuleExportType, RunParams, ServerState>>;
    /**
     * Параметры, которые будут переданы в загрузчик (и будут переданы на сервер модуля)
     */
    loaderParams?: LoaderParams;
    /**
     * Параметры, которые будут переданы в run-функцию модуля
     */
    runParams?: RunParams;
    /**
     * Функция, который позволяет дополнить/изменить параметры для фабрики
     */
    getFactoryParams?: (params: ServerState) => ServerState;
}

export type UseModuleFactoryResult<ModuleExportType> = {
    /**
     * Состояние загрузки модуля
     */
    loadingState: LoadingState;
    /**
     * Экспорт модуля
     */
    module: ModuleExportType | undefined;
}

export function useModuleFactory<
    LoaderParams,
    ServerState extends BaseModuleState,
    ModuleExportType = any,
    RunParams = void,
>({
    loader,
    loaderParams,
    runParams,
    getFactoryParams,
}: UseModuleFactoryParams<LoaderParams, ServerState, ModuleExportType, RunParams>): UseModuleFactoryResult<ModuleExportType> {
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    const [module, setModule] = useState<ModuleExportType | undefined>();

    useEffect(() => {
        let unmountFn: () => void | undefined;

        async function run() {
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as LoaderParams,
                });

                unmountFn = result.unmount;

                const factoryParams = (getFactoryParams
                    ? await getFactoryParams(result.moduleResources.moduleState as ServerState)
                    : result.moduleResources.moduleState) as ServerState;

                let moduleResult: ModuleExportType;

                /**
                 * Делаем 3 возможных варианта доставки фабрики:
                 * Для compat модулей фабрику можно записать прямо в window
                 * Для compat и для mf модулей делаем также возможным записи в поля factory и default
                 */
                const unwrappedModule = unwrapDefaultExport(result.module);

                if (typeof unwrappedModule === 'function') {
                    moduleResult = await unwrappedModule(factoryParams, runParams as RunParams);
                } else if (unwrappedModule.factory && typeof unwrappedModule.factory === 'function') {
                    moduleResult = await unwrappedModule.factory(factoryParams, runParams as RunParams);
                } else {
                    throw new Error(
                        `Module ${factoryParams.hostAppId} does not present a factory function,
                        try usign another hook, e.g. 'useModuleLoader' or 'useModuleMounter'`
                    )
                }

                // используем callback в setState, т.к. фабрика может вернуть модуль в виде функции
                setModule(() => moduleResult)

                setLoadingState('fulfilled');
            } catch (error) {
                setLoadingState('rejected');
                // eslint-disable-next-line no-console
                console.error(error);
            }
        }

        run();

        return function moduleCleanUp() {
            unmountFn?.();
        }
    }, [loader]);

    return {
        loadingState,
        module,
    };
}
