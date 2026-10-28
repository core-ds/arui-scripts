import React, { useEffect, useRef } from 'react';

import { useModuleMountTarget } from './hooks/use-module-mount-target';
import { reportModuleError } from './module-lifecycle';
import {
    createModuleSession,
    releaseModuleResources,
    resolveMountableModule,
} from './module-session';
import {
    type ModuleMounterErrorStage,
    type ModuleMounterOptions,
    type MountableModule,
} from './module-types';
import { type BaseModuleState, type Loader, type LoaderResult } from './types';

type CreateLazyMounterParams<
    LoaderParams,
    RunParams,
    ServerState extends BaseModuleState,
> = ModuleMounterOptions & {
    loader: Loader<LoaderParams, MountableModule<RunParams, ServerState>>;
    /**
     * Параметры, которые будут переданы в загрузчик (и будут переданы на сервер модуля)
     */
    loaderParams?: LoaderParams;
};

/**
 * Создает React.lazy-совместимую фабрику, которая лениво загружает и монтирует модуль.
 *
 * Это **клиентский** API: на сервере (в Node) фабрика не запускает загрузчик и рендерит
 * пустой outlet, чтобы не падать под `renderToPipeableStream`/`renderToString`. Настоящее
 * монтирование модуля происходит на клиенте. Для полноценного серверного рендеринга модуля
 * используйте `createSsrMounter`.
 */
export function createLazyMounter<
    LoaderParams = void,
    RunParams = Record<string, unknown>,
    ServerState extends BaseModuleState = BaseModuleState,
>({
    loader,
    loaderParams,
    ...options
}: CreateLazyMounterParams<LoaderParams, RunParams, ServerState>) {
    return async () => {
        // `createLazyMounter` — клиентский API. Под SSR (в Node) загрузчик обращается
        // к `document`/`XMLHttpRequest`, поэтому React.lazy-фабрику нельзя выполнять на сервере.
        // Возвращаем компонент с пустым outlet: он рендерится на сервере без запуска загрузчика,
        // а на клиенте гидрируется настоящим компонентом с той же разметкой.
        // SSR-совместимый вариант монтирования — `createSsrMounter`.
        if (typeof window === 'undefined') {
            const ServerOutlet = () => <div />;

            return {
                default: ServerOutlet,
            };
        }

        let loadStage: ModuleMounterErrorStage = 'resolve-export';
        let result: LoaderResult<MountableModule<RunParams, ServerState>>;

        try {
            result = await loader({
                getResourcesParams: loaderParams as LoaderParams,
                useShadowDom: false,
                onLoadError: (stage) => {
                    loadStage = stage;
                },
            });
        } catch (error) {
            reportModuleError(options, { error, stage: loadStage });
            throw error;
        }
        let module: MountableModule<RunParams, ServerState>;

        try {
            module = resolveMountableModule(result.module);
        } catch (error) {
            reportModuleError(options, { error, stage: 'resolve-export' });
            releaseModuleResources(result.unmount, options);
            throw error;
        }
        let activeInstances = 0;
        let resourceCleanupScheduled = false;

        function releaseResources() {
            activeInstances -= 1;

            if (activeInstances !== 0 || resourceCleanupScheduled) {
                return;
            }

            resourceCleanupScheduled = true;

            // В StrictMode React выполняет cleanup effect-а перед его повторным запуском.
            // Откладываем освобождение ресурсов, чтобы повторный mount успел увеличить счётчик.
            Promise.resolve().then(() => {
                resourceCleanupScheduled = false;

                if (activeInstances === 0) {
                    try {
                        result.unmount();
                    } catch (error) {
                        reportModuleError(options, { error, stage: 'unmount' });
                    }
                }
            });
        }

        function LazyComponent(runParams: RunParams) {
            const { mountTargetNode, afterTargetMountCallback } = useModuleMountTarget({});
            const runParamsRef = useRef(runParams);
            const failedRef = useRef(false);
            const sessionRef =
                useRef<ReturnType<typeof createModuleSession<RunParams, ServerState>>>();

            runParamsRef.current = runParams;
            // lazy модули, для которых не задан update просто перемонтируем
            const remountParams = module.update ? undefined : runParams;

            useEffect(() => {
                if (!mountTargetNode || failedRef.current) return undefined;
                const session = createModuleSession<RunParams, ServerState>({
                    load: async () => {
                        activeInstances += 1;
                        let released = false;

                        return {
                            ...result,
                            unmount: () => {
                                if (released) {
                                    return;
                                }
                                released = true;
                                releaseResources();
                            },
                        };
                    },
                    targetNode: mountTargetNode,
                    getRunParams: () => runParamsRef.current,
                    getOptions: () => ({
                        ...options,
                        onError: (event) => {
                            failedRef.current = true;
                            reportModuleError(options, event);
                        },
                    }),
                });

                sessionRef.current = session;

                return () => {
                    sessionRef.current = undefined;
                    session.dispose();
                };
            }, [mountTargetNode, remountParams]);

            useEffect(() => {
                sessionRef.current?.update(runParams);
            }, [runParams]);

            return <div ref={afterTargetMountCallback} />;
        }

        return {
            default: LazyComponent,
        };
    };
}
