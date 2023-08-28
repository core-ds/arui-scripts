import React from 'react';
import {
    createModuleLoader,
    createServerStateModuleFetcher,
    useModuleFactory, FactoryModule,
} from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';
import { Button } from '@alfalab/core-components/button';
import { Typography } from '@alfalab/core-components/typography';

type FactoryModuleRunParams = {
    organizationId: string;
    placementId: string;
};

type ModuleType = FactoryModule<Record<string, any>, FactoryModuleRunParams>;

const loader = createModuleLoader<ModuleType>({
    hostAppId: 'example',
    moduleId: 'ServerStateFactoryModule',
    getModuleResources: createServerStateModuleFetcher({ baseUrl: 'http://localhost:8082' }),
});

export const ServerStateFactoryModuleMounter = () => {
    const runParams = React.useMemo(() => ({
        organizationId: '123',
        placementId: '123',
    }), []);
    const { loadingState, module } = useModuleFactory({
        loader,
        runParams,
        getFactoryParams: (params) => {
            console.log(params)
            return params;
        }
    });

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            <div>
                { loadingState === 'pending' && <Spinner size='m' /> }
                { loadingState === 'rejected' && <div>Failed to load module</div> }

                {module && (<pre>{JSON.stringify(module, (key, value) => typeof value === 'function' ? `[Function ${value.name}]` : value, 2)}</pre>)}

                <Typography.Text tag='div'>
                    Снизу кнопка, на которую навешена функция из модуля, которая перезагружает страницу
                </Typography.Text>
                <Button onClick={module?.reloadPage}>
                    Перезагрузить
                </Button>
            </div>
        </Underlay>
    );
}
