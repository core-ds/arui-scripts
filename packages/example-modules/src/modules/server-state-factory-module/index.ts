// TODO: remove eslint-disable
/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-default-export */
import type { FactoryModule } from '@alfalab/scripts-modules';

const factory: FactoryModule = (runParams, moduleState) => ({
    someData: 'Some data here',
    reloadPage: () => location.reload(),
    runParams,
    ...moduleState,
});

export default factory;
