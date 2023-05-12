import React from 'react';
import type { ModuleMountFunction, ModuleUnmountFunction } from '@arui-scripts/widgets';
import ReactDOM from 'react-dom';
import { ServerWidgetMf } from './ServerWidgetMf';

export const mount: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ServerWidgetMf: mount', params);
    if (!targetNode) {
        throw new Error(`Target node is not defined for module ${moduleId}`);
    }

    ReactDOM.render(<ServerWidgetMf {...params} />, targetNode);
}
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerWidgetMf: unmount');
    if (!targetNode) {
        return;
    }

    ReactDOM.unmountComponentAtNode(targetNode);
}
