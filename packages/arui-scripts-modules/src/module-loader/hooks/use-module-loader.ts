import { useEffect, useRef, useState } from 'react';

import { Loader, ModuleResources } from '../types';

import { LoadingState } from './types';

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
        module: moduleAndResources?.module,
        resources: moduleAndResources?.resources,
    };
}
