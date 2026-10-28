import { useEffect, useRef, useState } from 'react';

import { createModuleSession } from '../module-session';
import { type ModuleMounterOptions, type MountableModule } from '../module-types';
import { type BaseModuleState, type Loader } from '../types';

import { type LoadingState } from './types';
import { useModuleMountTarget } from './use-module-mount-target';

export type UseModuleLoaderParams<
    LoaderParams,
    RunParams,
    ServerState extends BaseModuleState,
> = ModuleMounterOptions & {
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
    onReady,
    onError,
    readyTimeoutMs,
}: UseModuleLoaderParams<LoaderParams, RunParams, ServerState>): UseModuleLoaderResult {
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    const { mountTargetNode, afterTargetMountCallback, cssTargetSelector } = useModuleMountTarget({
        useShadowDom,
        createTargetNode,
    });

    // Мы не хотим чтобы изменение этих параметров тригерило ререндер и перемонтирование модуля,
    // но не хотим ломать правила хуков
    const loaderParamsRef = useRef(loaderParams);
    const runParamsRef = useRef(runParams);
    const optionsRef = useRef({ onReady, onError, readyTimeoutMs });
    const sessionRef = useRef<ReturnType<typeof createModuleSession<RunParams, ServerState>>>();

    loaderParamsRef.current = loaderParams;
    runParamsRef.current = runParams;
    optionsRef.current = { onReady, onError, readyTimeoutMs };

    useEffect(() => {
        if (!mountTargetNode) return undefined;
        setLoadingState('pending');
        const session = createModuleSession<RunParams, ServerState>({
            load: (abortSignal, onLoadError) =>
                loader({
                    getResourcesParams: loaderParamsRef.current,
                    abortSignal,
                    cssTargetSelector,
                    useShadowDom,
                    onLoadError,
                }),
            targetNode: mountTargetNode,
            getRunParams: () => runParamsRef.current as RunParams,
            getOptions: () => ({
                readyTimeoutMs: optionsRef.current.readyTimeoutMs,
                onReady: () => {
                    setLoadingState('fulfilled');
                    optionsRef.current.onReady?.();
                },
                onError: (event) => {
                    setLoadingState('rejected');
                    if (optionsRef.current.onError) {
                        optionsRef.current.onError(event);
                    } else {
                        // eslint-disable-next-line no-console
                        console.error(event.error);
                    }
                },
            }),
        });

        sessionRef.current = session;

        return () => {
            sessionRef.current = undefined;
            session.dispose();
        };
    }, [mountTargetNode, loader, cssTargetSelector, useShadowDom]);

    useEffect(() => {
        sessionRef.current?.update(runParams as RunParams);
    }, [runParams]);

    return {
        loadingState,
        targetElementRef: afterTargetMountCallback,
    };
}
