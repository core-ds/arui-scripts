import { useEffect, useState } from 'react';

import { FactoryModule } from '../module-types';
import { BaseModuleState, Loader } from '../types';
import { unwrapDefaultExport } from '../utils/unwrap-default-export';

import { LoadingState } from './types';

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
     * Функция, который позволяет дополнить/изменить серверный стейт модуля перед вызовом фабрики
     */
    getFactoryParams?: (params: ServerState) => ServerState;
};

export type UseModuleFactoryResult<ModuleExportType> = {
    /**
     * Состояние загрузки модуля
     */
    loadingState: LoadingState;
    /**
     * Экспорт модуля
     */
    module: ModuleExportType | undefined;
};

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
}: UseModuleFactoryParams<
    LoaderParams,
    ServerState,
    ModuleExportType,
    RunParams
>): UseModuleFactoryResult<ModuleExportType> {
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    const [module, setModule] = useState<ModuleExportType | undefined>();

    useEffect(() => {
        let unmountFn: () => void | undefined;
        const abortController = new AbortController();

        async function run() {
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as LoaderParams,
                    abortSignal: abortController.signal,
                });

                if (abortController.signal.aborted) {
                    return;
                }

                unmountFn = result.unmount;

                const serverState = (
                    getFactoryParams
                        ? await getFactoryParams(result.moduleResources.moduleState as ServerState)
                        : result.moduleResources.moduleState
                ) as ServerState;

                const moduleResult = await executeModuleFactory(
                    result.module,
                    serverState,
                    runParams,
                );

                // используем callback в setState, т.к. фабрика может вернуть модуль в виде функции
                setModule(() => moduleResult);

                setLoadingState('fulfilled');
            } catch (error) {
                if (abortController.signal.aborted) {
                    return;
                }
                setLoadingState('rejected');
                // eslint-disable-next-line no-console
                console.error(error);
            }
        }

        run();

        return function moduleCleanUp() {
            unmountFn?.();
            if (loadingState === 'pending') {
                abortController.abort();
            }
        };
    }, [loader]);

    return {
        loadingState,
        module,
    };
}

export async function executeModuleFactory<ModuleExportType, RunParams, ServerState extends BaseModuleState>(
    module: FactoryModule<ModuleExportType, RunParams, ServerState>,
    serverState: ServerState,
    runParams?: RunParams,
) {
    let moduleResult: ModuleExportType;

    /**
     * Делаем 3 возможных варианта доставки фабрики:
     * Для compat модулей фабрику можно записать прямо в window
     * Для compat и для mf модулей делаем также возможным записи в поля factory и default
     */
    const unwrappedModule = unwrapDefaultExport(module);

    if (typeof unwrappedModule === 'function') {
        moduleResult = await unwrappedModule(runParams as RunParams, serverState);
    } else if (
        unwrappedModule.factory &&
        typeof unwrappedModule.factory === 'function'
    ) {
        moduleResult = await unwrappedModule.factory(
            runParams as RunParams,
            serverState,
        );
    } else {
        throw new Error(
            `Module ${serverState.hostAppId} does not present a factory function,
                    try using another hook, e.g. 'useModuleLoader' or 'useModuleMounter'`,
        );
    }

    return moduleResult;
}
