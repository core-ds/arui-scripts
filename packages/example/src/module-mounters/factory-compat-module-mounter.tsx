import React from 'react';
import {
    createModuleFetcher,
    createModuleLoader,
    FactoryModule,
    useModuleFactory,
} from '@alfalab/scripts-modules';
import { Underlay } from '@alfalab/core-components/underlay';
import { Spinner } from '@alfalab/core-components/spinner';
import { Typography } from '@alfalab/core-components/typography';
import { Button } from '@alfalab/core-components/button';

const loader = createModuleLoader<FactoryModule>({
    hostAppId: 'example',
    moduleId: 'FactoryModuleCompat',
    getModuleResources: createModuleFetcher({
        baseUrl: 'http://localhost:8082',
    })
});

export const FactoryCompatModuleMaunter = () => {
    const { loadingState, module } = useModuleFactory({ loader });

    return (
        <Underlay padding='m' backgroundColor='info' shadow='shadow-s' borderSize={1} borderRadius='m'>
            <div>
                { loadingState === 'pending' && <Spinner size='m' /> }
                { loadingState === 'rejected' && <div>Failed to load module</div> }

                {module && (<pre>{JSON.stringify(module, (key, value) => typeof value === 'function' ? `[Function ${value.name}]` : value, 2)}</pre>)}


                <Typography.Text tag='div'>
                    Снизу кнопка, на которую навешена функция из модуля
                </Typography.Text>
                <Button onClick={module?.saySomething}>
                    Сказать
                </Button>
            </div>
        </Underlay>
    );
}
