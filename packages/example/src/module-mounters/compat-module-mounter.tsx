import React from 'react';
import {
    BaseModuleState,
    createModuleFetcher,
    createModuleLoader,
    MountableModule,
    useModuleMounter,
} from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const loader = createModuleLoader<MountableModule<any, BaseModuleState>>({
    hostAppId: 'example',
    moduleId: 'ModuleCompat',
    getModuleResources: createModuleFetcher({
        baseUrl: 'http://localhost:8082',
    })
});

export const CompatModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader
    });

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
