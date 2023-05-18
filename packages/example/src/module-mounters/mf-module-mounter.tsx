import React from 'react';
import {
    BaseModuleState,
    createClientResourcesFetcher,
    createModuleLoader,
    MountableModule,
    useModuleMounter,
} from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const loader = createModuleLoader<MountableModule<void, BaseModuleState>>({
    hostAppId: 'example',
    moduleId: 'ClientModuleMF',
    getModuleResources: createClientResourcesFetcher({
        baseUrl: 'http://localhost:8082',
        mountMode: 'mf',
    })
});

export const MfModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({ loader: loader });

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
