import { BaseModuleState, Loader, MountableModule } from '../types';
import { useCallback, useEffect, useState } from 'react';
import { LoadingState } from './types';
import { useModuleLoader } from './use-module-loader';

type UseModuleLoaderParams<LoaderParams, RunParams, ServerState extends BaseModuleState> = {
    loader: Loader<LoaderParams, MountableModule<RunParams, ServerState>>;
    loaderParams?: LoaderParams;
    runParams?: RunParams;
}

export function useModuleMounter<LoaderParams, RunParams, ServerState extends BaseModuleState>({
    loader,
    loaderParams,
    runParams,
}: UseModuleLoaderParams<LoaderParams, RunParams, ServerState>) {
    const [targetDiv, setTargetDiv] = useState<undefined | HTMLDivElement>();
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    // Мы не можем использовать useRef тут, useRef не будет тригерить ререндер, так как он не меняет ничего
    // внутри хуков. https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    const afterDivMountCallback = useCallback((node: HTMLDivElement | null) => {
        if (!node) {
            return;
        }
        // мы не можем маунтить реакт-приложение в элемент, созданный другим реакт-приложением, поэтому создаем див, лежащий
        // прямо внутри нашей targetNode
        const realTarget = document.createElement('div');

        node.appendChild(realTarget);
        setTargetDiv(realTarget);
    }, []);

    useEffect(() => {
        let unmountFn: () => void | undefined;

        async function run() {
            if (!targetDiv) {
                return;
            }
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as LoaderParams,
                });

                result.module.mount(targetDiv, runParams as RunParams, result.moduleResources.moduleState as ServerState);

                unmountFn = () => {
                    result.unmount();
                    result.module.unmount(targetDiv);
                };
            } catch (error) {
                setLoadingState('rejected');
                // eslint-disable-next-line no-console
                console.error(error);

                return;
            }
            setLoadingState('fulfilled');
        }

        run();

        return function moduleCleanUp() {
            console.log('unmounting...');
            unmountFn?.();
        };
    }, [targetDiv, loader]);

    return {
        loadingState,
        targetElementRef: afterDivMountCallback,
    };
}
