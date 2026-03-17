import { useEffect, useRef, useState } from 'react';

import { type Loader, type ModuleResources } from '../types';

import { type LoadingState } from './types';

export type UseModuleLoaderParams<ModuleExportType, GetResourcesParams> = {
    loader: Loader<GetResourcesParams, ModuleExportType>;
    loaderParams?: GetResourcesParams;
};

export type UseModuleLoaderResult<ModuleExportType> = {
    /**
     * Состояние загрузки модуля
     */
    loadingState: LoadingState;
    /**
     * Ошибка, возникшая при загрузке модуля.
     * Устанавливается только в случае loadingState === 'rejected'.
     */
    error?: Error;
    /**
     * Экспорт модуля
     */
    module: ModuleExportType | undefined;
    /**
     * Полный ответ от модуля
     */
    resources: ModuleResources | undefined;
};

export function useModuleLoader<ModuleExportType, GetResourcesParams>({
    loader,
    loaderParams,
}: UseModuleLoaderParams<
    ModuleExportType,
    GetResourcesParams
>): UseModuleLoaderResult<ModuleExportType> {
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    const [error, setError] = useState<Error | undefined>();
    const [moduleAndResources, setModuleAndResources] = useState<
        { module: ModuleExportType; resources: ModuleResources } | undefined
    >();

    // Мы не хотим чтобы изменение этих параметров тригерило ререндер и перемонтирование модуля,
    // но не хотим ломать правила хуков
    const loaderParamsRef = useRef(loaderParams);
    const loadingStateRef = useRef(loadingState);

    loaderParamsRef.current = loaderParams;
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

                setModuleAndResources({
                    module: result.module,
                    resources: result.moduleResources,
                });

                setLoadingState('fulfilled');
            } catch (e) {
                if (abortController.signal.aborted) {
                    return;
                }

                const err = e as Error;

                // eslint-disable-next-line no-console
                console.error(err);
                setError(err);
                setLoadingState('rejected');
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
        error,
        module: moduleAndResources?.module,
        resources: moduleAndResources?.resources,
    };
}
