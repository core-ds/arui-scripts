import React from 'react';

import { Spinner } from '@alfalab/core-components/spinner';
import { Underlay } from '@alfalab/core-components/underlay';
import {
    createModuleFetcher,
    createModuleLoader,
    type MountableModule,
    useModuleMounter,
} from '@alfalab/scripts-modules';

const loader = createModuleLoader<MountableModule>({
    hostAppId: 'example',
    moduleId: 'ModuleCompat',
    getModuleResources: createModuleFetcher({
        baseUrl: 'http://localhost:8082',
    }),
});

export const CompatModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        useShadowDom: true,
    });

    return (
        <Underlay
            padding='m'
            backgroundColor='info'
            shadow='shadow-s'
            borderSize={1}
            borderRadius='m'
        >
            {loadingState === 'pending' && <Spinner size='m' />}
            {loadingState === 'rejected' && <div>Failed to load module</div>}

            <div ref={targetElementRef} />
        </Underlay>
    );
};
