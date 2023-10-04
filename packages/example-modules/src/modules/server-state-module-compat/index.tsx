import React from 'react';
import ReactDOM from 'react-dom';

import type { ModuleMountFunction, ModuleUnmountFunction, WindowWithModule } from '@alfalab/scripts-modules';

import { ServerStateModuleCompat } from '#/modules/server-state-module-compat/server-state-module-compat';

const mountModule: ModuleMountFunction<Record<string, unknown>> = (targetNode, runParams, serverState) => {
    console.log('ServerStateModuleCompat: mount', { runParams, serverState });

    ReactDOM.render(
        <ServerStateModuleCompat serverState={serverState} runParams={runParams} />,
        targetNode,
    );
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerStateModuleCompat: cleanup');

    if (targetNode) {
        ReactDOM.unmountComponentAtNode(targetNode);
    }
};

(window as WindowWithModule).ServerStateModuleCompat = {
    mount: mountModule,
    unmount: unmountModule,
};
