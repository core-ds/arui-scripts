import { useEffect, useState } from 'react';
import { Loader, ModuleResources } from '../types';
import { LoadingState } from './types';

export function useModuleLoader<ModuleExportType, GetResourcesParams>(loader: Loader<GetResourcesParams, ModuleExportType>, loaderParams?: GetResourcesParams) {
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');

    const [moduleAndResources, setModuleAndResources] = useState<{ module: ModuleExportType, resources: ModuleResources } | undefined>();
    useEffect(() => {
        let unmountFn: () => void | undefined;

        async function run() {
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as GetResourcesParams,
                });

                result.moduleResources
                setModuleAndResources({
                    module: result.module,
                    resources: result.moduleResources,
                })
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
        module: moduleAndResources?.module,
        resources: moduleAndResources?.resources,
    };
}
