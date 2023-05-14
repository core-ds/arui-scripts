import React, { useMemo } from 'react';
import { createLoader, GetResourcesRequest, useModuleLoader, getModuleResourcesPath } from '@arui-scripts/modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const customFetch = (loaderParams: GetResourcesRequest) => {
    return fetch(`http://localhost:8081/${getModuleResourcesPath}`, {
        method: 'POST',
        body: JSON.stringify(loaderParams),
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => response.json());
};

export const ServerEmbeddedModuleMounter = () => {
    const loader = useMemo(() => createLoader({
        hostAppId: 'example',
        fetchFunction: customFetch,
    }), []);

    const { loadingState, targetElementRef } = useModuleLoader("ServerModuleEmbedded", loader);

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
