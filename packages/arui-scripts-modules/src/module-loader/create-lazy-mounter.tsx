import React, { useEffect } from 'react';

import { useModuleMountTarget } from './hooks/use-module-mount-target';
import { unwrapDefaultExport } from './utils/unwrap-default-export';
import { type MountableModule } from './module-types';
import { type BaseModuleState, type Loader } from './types';

type CreateLazyMounterParams<LoaderParams, RunParams, ServerState extends BaseModuleState> = {
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
>({ loader, loaderParams }: CreateLazyMounterParams<LoaderParams, RunParams, ServerState>) {
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

        const result = await loader({
            getResourcesParams: loaderParams as LoaderParams,
            useShadowDom: false,
        });
        const module = unwrapDefaultExport(result.module);

        function LazyComponent(runParams: RunParams) {
            const { mountTargetNode, afterTargetMountCallback } = useModuleMountTarget({});

            useEffect(() => {
                if (!mountTargetNode) {
                    return;
                }

                module.mount(
                    mountTargetNode,
                    runParams,
                    result.moduleResources.moduleState as ServerState,
                );
            }, [runParams, mountTargetNode]);

            return <div ref={afterTargetMountCallback} />;
        }

        return {
            default: LazyComponent,
        };
    };
}
