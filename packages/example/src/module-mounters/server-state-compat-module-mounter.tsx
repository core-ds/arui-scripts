import React, { useMemo } from 'react';
import {
    createModuleLoader,
    MountableModule,
    BaseModuleState,
    useModuleMounter,
    createServerStateModuleFetcher,
} from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';

const loader = createModuleLoader<MountableModule<any, BaseModuleState>, { something: string }>({
    hostAppId: 'example',
    moduleId: 'ServerStateModuleCompat',
    getModuleResources: createServerStateModuleFetcher({ baseUrl: 'http://localhost:8082' }),
});

export const ServerStateCompatModuleMounter = () => {
    const { loadingState, targetElementRef } = useModuleMounter({
        loader,
        runParams: { test: 'test' },
        loaderParams: { something: 'foo'}
    });

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            { loadingState === 'pending' && <Spinner size='m' /> }
            { loadingState === 'rejected' && <div>Failed to load module</div> }

            <div ref={ targetElementRef } />
        </Underlay>
    );
}
