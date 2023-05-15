import React from 'react';
import { createClientLoader, useModuleLoader } from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const loader = createClientLoader({
    baseUrl: 'http://localhost:8081/',
    mountMode: 'mf',
});

export const MfModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleLoader("ClientModuleMF", loader);

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
