import { useEffect, useState } from 'react';

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

    useEffect(() => {
        let unmountFn: () => void | undefined;
        const abortController = new AbortController();

        async function run() {
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as GetResourcesParams,
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
            if (loadingState === 'pending') {
                abortController.abort();
            }
        };
        // Мы не хотим чтобы loader обновлялся при изменении run-params и loader-params, это осознанное решение
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loader]);

    return {
        loadingState,
        module: moduleAndResources?.module,
        resources: moduleAndResources?.resources,
    };
}
