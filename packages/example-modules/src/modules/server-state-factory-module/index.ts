import type { FactoryModule } from '@alfalab/scripts-modules';

const factory: FactoryModule = (runParams, moduleState) => ({
    someData: 'Some data here',
    reloadPage: () => location.reload(),
    runParams,
    ...moduleState
});


export default factory
