import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
import ReactDOM from 'react-dom';
import React from 'react';
import { ServerStateModuleCompat } from '#/modules/server-state-module-compat/server-state-module-compat';

const mountModule: ModuleMountFunction<any, any> = (targetNode, runParams, serverState) => {
    console.log('ServerStateModuleCompat: mount', { runParams, serverState });

    ReactDOM.render(<ServerStateModuleCompat serverState={serverState} runParams={runParams} />, targetNode);
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerStateModuleCompat: cleanup');

    if (targetNode) {
        ReactDOM.unmountComponentAtNode(targetNode);
    }
};

// TODO: типизировать
(window as any).ServerStateModuleCompat = {
    mount: mountModule,
    unmount: unmountModule,
};
