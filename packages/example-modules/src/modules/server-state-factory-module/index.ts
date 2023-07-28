import type { BaseModuleState } from '@alfalab/scripts-modules';

function factory(moduleState: BaseModuleState) {
    return {
        someData: 'Some data here',
        reloadPage: () => location.reload(),
        ...moduleState 
    }
}

export default factory
