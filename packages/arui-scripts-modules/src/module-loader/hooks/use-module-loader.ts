import { useEffect, useState } from 'react';
import { Loader, ModuleResources } from '../types';
import { LoadingState } from './types';

export type UseModuleLoaderParams<ModuleExportType, GetResourcesParams> = {
    loader: Loader<GetResourcesParams, (resources: ModuleResources) => ModuleExportType>;
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
}

export function useModuleLoader<ModuleExportType, GetResourcesParams>({
    loader,
    loaderParams,
}: UseModuleLoaderParams<ModuleExportType, GetResourcesParams>): UseModuleLoaderResult<ModuleExportType> {
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');

    const [moduleAndResources, setModuleAndResources] = useState<ModuleExportType | undefined>();
    useEffect(() => {
        let unmountFn: () => void | undefined;

        async function run() {
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as GetResourcesParams,
                });

                const module = await result.module?.(result.moduleResources)

                setModuleAndResources(module)

                unmountFn = result.unmount;

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
        module: moduleAndResources,
    };
}
