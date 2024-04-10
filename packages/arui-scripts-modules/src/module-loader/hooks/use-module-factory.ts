import { useEffect, useState } from 'react';

import { executeModuleFactory } from '../execute-module-factory';
import { FactoryModule } from '../module-types';
import { BaseModuleState, Loader } from '../types';

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
