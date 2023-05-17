import React from 'react';
import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
import ReactDOM from 'react-dom';
import { ServerModuleMf } from './ServerModuleMf';

export const mount: ModuleMountFunction<any, any> = (targetNode, runParams, serverState) => {
    console.log('ServerModuleMf: mount', { runParams, serverState });
    ReactDOM.render(<ServerModuleMf runParams={runParams} serverState={serverState} />, targetNode);
}
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerModuleMf: unmount');

    ReactDOM.unmountComponentAtNode(targetNode);
}
