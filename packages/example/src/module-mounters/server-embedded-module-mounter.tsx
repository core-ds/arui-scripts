import React, { useMemo } from 'react';
import {
    GetResourcesRequest,
    getServerFetcherParams, createModuleLoader, MountableModule, BaseModuleState, useModuleMounter,
} from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const customFetch = (loaderParams: GetResourcesRequest<{ something: string }>) => {
    const fetchParams = getServerFetcherParams();
    return fetch(`http://localhost:8081/${fetchParams.relativePath}`, {
        method: fetchParams.method,
        body: JSON.stringify(loaderParams),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => response.json());
};

const loader = createModuleLoader<MountableModule<any, BaseModuleState>, { something: string }>({
    hostAppId: 'example',
    moduleId: 'ServerModuleEmbedded',
    getModuleResources: customFetch,
});

export const ServerEmbeddedModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({ loader: loader, runParams: { test: 'test' }, loaderParams: { something: 'foo'} });

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
