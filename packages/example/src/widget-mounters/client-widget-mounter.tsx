import React from 'react';
import { createClientLoader, useWidgetLoader } from '@arui-scripts/widgets';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const loader = createClientLoader({
    baseUrl: 'http://localhost:8081/',
});

export const ClientWidgetMounter = () => {
    const { loadingState, targetElementRef } = useWidgetLoader("ClientWidgetLegacy", loader);

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load widget</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
