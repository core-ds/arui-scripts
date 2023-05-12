import React from 'react';
import { createLoader, useWidgetLoader } from '@arui-scripts/widgets';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const loader = createLoader({
    hostAppId: 'example',
    fetchFunction: (loaderParams) => {
        return fetch('http://localhost:8081/api/getModuleResources', {
            method: 'POST',
            body: JSON.stringify(loaderParams),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json());
    },
});

export const ServerLegacyWidgetMounter = () => {
    const { loadingState, targetElementRef } = useWidgetLoader("ServerWidgetLegacy", loader);

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load widget</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
