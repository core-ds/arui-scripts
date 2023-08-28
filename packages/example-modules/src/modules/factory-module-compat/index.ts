import type {
    FactoryModule,
    WindowWithModule,
} from '@alfalab/scripts-modules';


const factory: FactoryModule = (runParams, moduleState) => ({
    someData: 'Some data here',
    saySomething: () => alert('something'),
    runParams,
    ...moduleState
});

(window as WindowWithModule).FactoryModuleCompat = factory;
