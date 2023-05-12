import React from 'react';
import ReactDOM from 'react-dom';
import type { ModuleMountFunction, ModuleUnmountFunction } from '@arui-scripts/widgets';
import { ClientWidgetMf } from './ClientWidgetMf';

export const mount: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ClientWidgetMf: mount', params);
    if (!targetNode) {
        throw new Error(`Target node is not defined for module ${moduleId}`);
    }

    ReactDOM.render(<ClientWidgetMf />, targetNode);
}
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('ClientWidgetMf: unmount');
    if (!targetNode) {
        return;
    }

    ReactDOM.unmountComponentAtNode(targetNode);
}
