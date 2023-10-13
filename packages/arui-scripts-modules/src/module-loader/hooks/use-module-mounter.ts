import { useEffect, useState } from 'react';

import { MountableModule } from '../module-types';
import { BaseModuleState, Loader } from '../types';
import { unwrapDefaultExport } from '../utils/unwrap-default-export';

import { LoadingState } from './types';
import { useModuleMountTarget } from './use-module-mount-target';

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
     * Флаг, указывающий, нужно ли использовать shadow-dom для монтирования модуля.
     * По умолчанию false.
     * Модуль должен быть собран с помощью версии arui-scripts, которая поддерживает shadow-dom.
     */
    useShadowDom?: boolean;
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
    targetElementRef: (node: HTMLElement | null) => void;
};

export function useModuleMounter<LoaderParams, RunParams, ServerState extends BaseModuleState>({
    loader,
    loaderParams,
    runParams,
    createTargetNode,
    useShadowDom,
}: UseModuleLoaderParams<LoaderParams, RunParams, ServerState>): UseModuleLoaderResult {
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    const {
        mountTargetNode,
        afterTargetMountCallback,
        cssTargetSelector,
    } = useModuleMountTarget({ useShadowDom, createTargetNode });

    useEffect(() => {
        let unmountFn: () => void | undefined;

        async function run() {
            if (!mountTargetNode) {
                return;
            }
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParams as LoaderParams,
                    cssTargetSelector,
                });

                const module = unwrapDefaultExport(result.module);

                module.mount(
                    mountTargetNode,
                    runParams as RunParams,
                    result.moduleResources.moduleState as ServerState,
                );

                unmountFn = () => {
                    result.unmount();
                    module.unmount(mountTargetNode);
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
    }, [mountTargetNode, loader, cssTargetSelector]);

    return {
        loadingState,
        targetElementRef: afterTargetMountCallback,
    };
}
