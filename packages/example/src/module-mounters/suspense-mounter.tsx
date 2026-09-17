import React, { Suspense } from 'react';

import { Spinner } from '@alfalab/core-components/spinner';
import { Underlay } from '@alfalab/core-components/underlay';
import { createServerStateModuleFetcher, type BaseModuleState } from '@alfalab/scripts-modules';
import { createSsrMounter } from '@alfalab/scripts-modules/ssr';

type ModuleRunParams = {
    name: string;
    counter: number;
};

const getModuleResources = createServerStateModuleFetcher({
    baseUrl: 'http://localhost:8082',
});

const { ModuleComponent: ServerStateSsrModule } = createSsrMounter<
    ModuleRunParams,
    ModuleRunParams,
    undefined,
    BaseModuleState
>({
    hostAppId: 'example',
    moduleId: 'ServerStateModule',
    getModuleResources,
});

export const SuspenseMounter = () => {
    const [counter, setCounter] = React.useState(1);
    const runParams = { name: 'Vasia', counter };

    return (
        <Underlay
            padding='m'
            backgroundColor='info'
            shadow='shadow-s'
            borderSize={1}
            borderRadius='m'
        >
            <div>
                <button type='button' onClick={() => setCounter((prevState) => prevState + 1)}>
                    Change run params
                </button>

                <Suspense fallback={<Spinner />}>
                    <ServerStateSsrModule
                        instanceId='server-state-ssr-demo'
                        runParams={runParams}
                        ssrRunParams={runParams}
                    />
                </Suspense>
            </div>
        </Underlay>
    );
};
