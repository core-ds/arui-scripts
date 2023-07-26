import React from 'react';
import {
    createModuleLoader,
    useModuleMounter,
    MountableModule,
    BaseModuleState,
    createServerStateModuleFetcher,
} from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const loader = createModuleLoader<MountableModule<{ some: string }, BaseModuleState>>({
    hostAppId: 'example',
    moduleId: 'ServerStateModule',
    getModuleResources: createServerStateModuleFetcher({ baseUrl: 'http://localhost:8082' }),
});

export const ServerStateModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        runParams: { some: 'anything that you want' }
    });

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
