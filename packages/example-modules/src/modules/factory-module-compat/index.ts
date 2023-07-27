import type { BaseModuleState, WindowWithModule } from '@alfalab/scripts-modules';



(window as WindowWithModule).FactoryModuleCompat = (moduleState: BaseModuleState) => ({
  someData: 'Some data here',
  saySomething: () => alert('something'),
  ...moduleState
});
