import React from 'react';
import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
import ReactDOM from 'react-dom';
import { ServerStateModule } from './ServerStateModule';

export const mount: ModuleMountFunction<any, any> = (targetNode, runParams, serverState) => {
    console.log('ServerStateModule: mount', { runParams, serverState });
    ReactDOM.render(<ServerStateModule runParams={runParams} serverState={serverState} />, targetNode);
}
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerStateModule: unmount');

    ReactDOM.unmountComponentAtNode(targetNode);
}
