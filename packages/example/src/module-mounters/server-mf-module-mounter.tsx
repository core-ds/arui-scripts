import React, { useMemo } from 'react';
import {
    createModuleLoader,
    getServerFetcherParams,
    GetResourcesRequest,
    useModuleMounter,
    MountableModule, BaseModuleState,
} from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const customFetch = (loaderParams: GetResourcesRequest) => {
    const fetchParams = getServerFetcherParams();
    return fetch(`http://localhost:8081/${fetchParams.relativePath}`, {
        method: fetchParams.method,
        body: JSON.stringify(loaderParams),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => response.json());
};

const loader = createModuleLoader<MountableModule<{ some: string }, BaseModuleState>>({
    hostAppId: 'example',
    moduleId: 'ServerModuleMF',
    getModuleResources: customFetch,
});

export const ServerMfModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({ loader: loader, runParams: { some: 'anything that you want' } });

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
