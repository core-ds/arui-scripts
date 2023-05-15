import React from 'react';
import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
import ReactDOM from 'react-dom';
import { ServerModuleMf } from './ServerModuleMf';

export const mount: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ServerModuleMf: mount', params);
    if (!targetNode) {
        throw new Error(`Target node is not defined for module ${moduleId}`);
    }

    ReactDOM.render(<ServerModuleMf {...params} />, targetNode);
}
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerModuleMf: unmount');
    if (!targetNode) {
        return;
    }

    ReactDOM.unmountComponentAtNode(targetNode);
}
