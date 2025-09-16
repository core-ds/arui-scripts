import { useEffect, useRef, useState } from 'react';

import { executeModuleFactory } from '../execute-module-factory';
import { type FactoryModule } from '../module-types';
import { type BaseModuleState, type Loader } from '../types';

import { type LoadingState } from './types';

export type UseModuleFactoryParams<
    LoaderParams,
    ServerState extends BaseModuleState,
    // для корректного выведения типов у потребителей нужно использовать именно any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // для корректного выведения типов у потребителей нужно использовать именно any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // Мы не хотим чтобы изменение этих параметров тригерило ререндер и перемонтирование модуля,
    // но не хотим ломать правила хуков
    const loaderParamsRef = useRef(loaderParams);
    const runParamsRef = useRef(runParams);
    const getFactoryParamsRef = useRef(getFactoryParams);
    const loadingStateRef = useRef(loadingState);

    loaderParamsRef.current = loaderParams;
    runParamsRef.current = runParams;
    getFactoryParamsRef.current = getFactoryParams;
    loadingStateRef.current = loadingState;

    useEffect(() => {
        let unmountFn: () => void | undefined;
        const abortController = new AbortController();

        async function run() {
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParamsRef.current,
                    abortSignal: abortController.signal,
                });

                if (abortController.signal.aborted) {
                    return;
                }

                unmountFn = result.unmount;

                const serverState = (
                    getFactoryParamsRef.current
                        ? await getFactoryParamsRef.current(
                              result.moduleResources.moduleState as ServerState,
                          )
                        : result.moduleResources.moduleState
                ) as ServerState;

                const moduleResult = await executeModuleFactory(
                    result.module,
                    serverState,
                    runParamsRef.current,
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
            if (loadingStateRef.current === 'pending') {
                abortController.abort();
            }
        };
    }, [loader]);

    return {
        loadingState,
        module,
    };
}
