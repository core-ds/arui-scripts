import { useCallback, useEffect, useState } from 'react';

import { MountableModule } from '../module-types';
import { BaseModuleState, Loader } from '../types';
import { unwrapDefaultExport } from '../utils/unwrap-default-export';

import { LoadingState } from './types';

export type UseModuleLoaderParams<LoaderParams, RunParams, ServerState extends BaseModuleState> = {
    /**
     * Загрузчик модуля
     */
    loader: Loader<LoaderParams, MountableModule<RunParams, ServerState>>;
    /**
     * Параметры, которые будут переданы в загрузчик (и будут переданы на сервер модуля)
     */
    loaderParams?: LoaderParams;
    /**
     * Параметры, которые будут переданы в run-функцию модуля
     */
    runParams?: RunParams;
    /**
     * Опциональная функция, которая будет вызвана для создания DOM-ноды, в которую будет монтироваться модуль.
     * По умолчанию будет создан div.
     */
    createTargetNode?: () => HTMLElement;
};

export type UseModuleLoaderResult = {
    /**
     * Состояние загрузки модуля
     */
    loadingState: LoadingState;
    /**
     * Функция, которая должна быть передана в ref-проп элемента, в который будет монтироваться модуль.
     * @param node
     */
    targetElementRef: (node: HTMLDivElement | null) => void;
};

export function useModuleMounter<LoaderParams, RunParams, ServerState extends BaseModuleState>({
    loader,
    loaderParams,
    runParams,
    createTargetNode,
}: UseModuleLoaderParams<LoaderParams, RunParams, ServerState>): UseModuleLoaderResult {
    const [targetNode, setTargetNode] = useState<undefined | HTMLElement>();
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    // Мы не можем использовать useRef тут, useRef не будет тригерить ререндер, так как он не меняет ничего
    // внутри хуков. https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    const afterDivMountCallback = useCallback((node: HTMLDivElement | null) => {
        if (!node) {
            return;
        }
        // мы не можем маунтить реакт-приложение в элемент, созданный другим реакт-приложением, поэтому создаем элемент, лежащий
        // прямо внутри нашей targetNode
        const realTarget = createTargetNode ? createTargetNode() : document.createElement('div');

        node.appendChild(realTarget);
        setTargetNode(realTarget);
    }, []);

    useEffect(() => {
        let unmountFn: () => void | undefined;

        async function run() {
            if (!targetNode) {
                return;
            }
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as LoaderParams,
                });

                const module = unwrapDefaultExport(result.module);

                module.mount(
                    targetNode,
                    runParams as RunParams,
                    result.moduleResources.moduleState as ServerState,
                );

                unmountFn = () => {
                    result.unmount();
                    module.unmount(targetNode);
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
            unmountFn?.();
        };
        // Мы не хотим чтобы loader обновлялся при изменении run-params и loader-params, это осознанное решение
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetNode, loader]);

    return {
        loadingState,
        targetElementRef: afterDivMountCallback,
    };
}
