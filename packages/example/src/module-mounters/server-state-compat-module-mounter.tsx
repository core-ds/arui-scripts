import React from 'react';

import { Spinner } from '@alfalab/core-components/spinner';
import { Underlay } from '@alfalab/core-components/underlay';
import {
    createModuleLoader,
    createServerStateModuleFetcher,
    type MountableModule,
    useModuleMounter,
} from '@alfalab/scripts-modules';

type ModuleRunParams = {
    test: string;
};

const loader = createModuleLoader<MountableModule<ModuleRunParams>, { something: string }>({
    hostAppId: 'example',
    moduleId: 'ServerStateModuleCompat',
    getModuleResources: createServerStateModuleFetcher({ baseUrl: 'http://localhost:8082' }),
});

export const ServerStateCompatModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        runParams: { test: 'test' },
        loaderParams: { something: 'foo' },
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
