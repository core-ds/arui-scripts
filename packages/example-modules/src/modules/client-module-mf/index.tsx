import React from 'react';
import ReactDOM from 'react-dom';
import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
import { ClientModuleMf } from './ClientModuleMf';

export const mount: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ClientModuleMf: mount', params);
    if (!targetNode) {
        throw new Error(`Target node is not defined for module ${moduleId}`);
    }

    ReactDOM.render(<ClientModuleMf />, targetNode);
}
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('ClientModuleMf: unmount');
    if (!targetNode) {
        return;
    }

    ReactDOM.unmountComponentAtNode(targetNode);
}
