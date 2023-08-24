import type {
    BaseModuleState,
    FactoryModule,
    WindowWithModule,
} from '@alfalab/scripts-modules';


const factory: FactoryModule = (moduleState, runParams) => ({
    someData: 'Some data here',
    saySomething: () => alert('something'),
    runParams,
    ...moduleState
});

(window as WindowWithModule).FactoryModuleCompat = factory;
