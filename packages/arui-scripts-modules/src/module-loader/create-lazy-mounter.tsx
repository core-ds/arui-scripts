import React, { useEffect } from 'react';

import { useModuleMountTarget } from './hooks/use-module-mount-target';
import { unwrapDefaultExport } from './utils/unwrap-default-export';
import { MountableModule } from './module-types';
import { BaseModuleState, Loader } from './types';

type CreateLazyMounterParams<LoaderParams, RunParams, ServerState extends BaseModuleState> = {
    loader: Loader<LoaderParams, MountableModule<RunParams, ServerState>>;
    /**
     * Параметры, которые будут переданы в загрузчик (и будут переданы на сервер модуля)
     */
    loaderParams?: LoaderParams;
}

export function createLazyMounter<LoaderParams = void, RunParams = Record<string, unknown>, ServerState extends BaseModuleState = BaseModuleState>({
    loader,
    loaderParams,
}: CreateLazyMounterParams<LoaderParams, RunParams, ServerState>) {
    return async () => {
        const result = await loader({
            getResourcesParams: loaderParams as LoaderParams,
            useShadowDom: false,
        });
        const module = unwrapDefaultExport(result.module);

        function LazyComponent(runParams: RunParams) {
            const {
                mountTargetNode,
                afterTargetMountCallback,
            } = useModuleMountTarget({});

            useEffect(() => {
                if (!mountTargetNode) {
                    return;
                }

                module.mount(
                    mountTargetNode,
                    runParams as RunParams,
                    result.moduleResources.moduleState as ServerState,
                );
            }, [runParams, mountTargetNode]);

            return (<div ref={afterTargetMountCallback}/>)
        }

        return {
            default: LazyComponent,
        };
    };
}
