import React from 'react';

import { Spinner } from '@alfalab/core-components/spinner';
import { Underlay } from '@alfalab/core-components/underlay';
import {
    BaseModuleState,
    createModuleFetcher,
    createModuleLoader,
    MountableModule,
    useModuleMounter,
} from '@alfalab/scripts-modules';

const loader = createModuleLoader<MountableModule<Record<string, string>, BaseModuleState>>({
    hostAppId: 'example',
    moduleId: 'Module',
    getModuleResources: createModuleFetcher({
        baseUrl: 'http://localhost:8082',
    }),
});

type Props = {
    runParams?: Record<string, string>;
};

export const ModuleMounter = ({ runParams }: Props) => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        useShadowDom: true,
        runParams,
    });

    return (
        <React.Fragment>
            <div className="module-shadow-dom-style">
                К этому элементу не должны примениться стили из модуля
            </div>

            <Underlay
                padding="m"
                backgroundColor="info"
                shadow="shadow-s"
                borderSize={ 1 }
                borderRadius="m"
            >
                { loadingState === 'pending' && <Spinner size="m"/> }
                { loadingState === 'rejected' && <div>Failed to load module</div> }

                <div ref={ targetElementRef }/>
            </Underlay>
        </React.Fragment>
    );
};
