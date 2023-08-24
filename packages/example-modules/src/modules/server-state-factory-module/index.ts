import type { FactoryModule } from '@alfalab/scripts-modules';

const factory: FactoryModule = (moduleState, runParams) => ({
    someData: 'Some data here',
    reloadPage: () => location.reload(),
    runParams,
    ...moduleState
});


export default factory
