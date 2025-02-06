import React, { lazy, Suspense } from 'react';

import { Spinner } from '@alfalab/core-components/spinner';
import { Underlay } from '@alfalab/core-components/underlay';
import {
    createLazyMounter,
    createModuleLoader,
    createServerStateModuleFetcher,
    MountableModule,
} from '@alfalab/scripts-modules';

type ModuleRunParams = {
    name: string;
    counter: number;
};

const loader = createModuleLoader<MountableModule<ModuleRunParams>>({
    hostAppId: 'example',
    moduleId: 'ServerStateModule',
    getModuleResources: createServerStateModuleFetcher({ baseUrl: 'http://localhost:8082' }),
});

const LazyModule = lazy(createLazyMounter({ loader }));

export const SuspenseMounter = () => {
    const [counter, setCounter] = React.useState(1);

    return (
        <Underlay
            padding="m"
            backgroundColor="info"
            shadow="shadow-s"
            borderSize={ 1 }
            borderRadius="m"
        >
            <div>
                <button
                    type="button"
                    onClick={() => setCounter((prevState) => prevState + 1)}
                >
                    Change run params
                </button>

                <Suspense fallback={ <Spinner/> }>
                    <LazyModule name="Vasia" counter={counter}/>
                </Suspense>
            </div>
        </Underlay>
    );
};
