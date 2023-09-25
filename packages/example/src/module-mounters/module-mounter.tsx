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

const loader = createModuleLoader<MountableModule<void, BaseModuleState>>({
    hostAppId: 'example',
    moduleId: 'Module',
    getModuleResources: createModuleFetcher({
        baseUrl: 'http://localhost:8082',
    }),
});

export const ModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
    });

    return (
        <Underlay
            padding='m'
            backgroundColor='info'
            shadow='shadow-s'
            borderSize={1}
            borderRadius='m'
        >
            {loadingState === 'pending' && <Spinner size='m' />}
            {loadingState === 'rejected' && <div>Failed to load module</div>}

            <div ref={targetElementRef} />
        </Underlay>
    );
};
