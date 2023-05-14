import React, { useMemo } from 'react';
import { createLoader, getModuleResourcesPath, GetResourcesRequest, useModuleLoader } from '@arui-scripts/modules';
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

export const ServerMfModuleMounter = () => {
    const loader = useMemo(() => createLoader({
        hostAppId: 'example',
        fetchFunction: customFetch,
        getModuleRequestParams: async () => ({
            paramName: 'some param that will be passed to module',
        }),
    }), []);

    const { loadingState, targetElementRef } = useModuleLoader("ServerModuleMF", loader);

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
