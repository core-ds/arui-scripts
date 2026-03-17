import { useEffect, useRef, useState } from 'react';

import { type MountableModule } from '../module-types';
import { type BaseModuleState, type Loader } from '../types';
import { unwrapDefaultExport } from '../utils/unwrap-default-export';

import { type LoadingState } from './types';
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
     * Ошибка, возникшая при загрузке или монтировании модуля.
     * Устанавливается только в случае loadingState === 'rejected'.
     */
    error?: Error;
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
    const [error, setError] = useState<Error | undefined>();
    const { mountTargetNode, afterTargetMountCallback, cssTargetSelector } = useModuleMountTarget({
        useShadowDom,
        createTargetNode,
    });

    // Мы не хотим чтобы изменение этих параметров тригерило ререндер и перемонтирование модуля,
    // но не хотим ломать правила хуков
    const loaderParamsRef = useRef(loaderParams);
    const runParamsRef = useRef(runParams);
    const loadingStateRef = useRef(loadingState);

    loaderParamsRef.current = loaderParams;
    runParamsRef.current = runParams;
    loadingStateRef.current = loadingState;

    useEffect(() => {
        let unmountFn: () => void | undefined;
        const abortController = new AbortController();

        async function run() {
            if (!mountTargetNode) {
                return;
            }
            setLoadingState('pending');
            try {
                const result = await loader({
                    getResourcesParams: loaderParamsRef.current,
                    abortSignal: abortController.signal,
                    cssTargetSelector,
                    useShadowDom,
                });

                if (abortController.signal.aborted) {
                    return;
                }

                const module = unwrapDefaultExport(result.module);

                module.mount(
                    mountTargetNode,
                    runParamsRef.current as RunParams,
                    result.moduleResources.moduleState as ServerState,
                );

                unmountFn = () => {
                    result.unmount();
                    module.unmount(mountTargetNode);
                };
            } catch (e) {
                if (abortController.signal.aborted) {
                    return;
                }

                const err = e as Error;

                // eslint-disable-next-line no-console
                console.error(err);
                setError(err);
                setLoadingState('rejected');

                return;
            }
            setLoadingState('fulfilled');
        }

        run();

        return function moduleCleanUp() {
            unmountFn?.();
            if (loadingStateRef.current === 'pending') {
                abortController.abort();
            }
        };
    }, [mountTargetNode, loader, cssTargetSelector, useShadowDom]);

    return {
        loadingState,
        error,
        targetElementRef: afterTargetMountCallback,
    };
}
