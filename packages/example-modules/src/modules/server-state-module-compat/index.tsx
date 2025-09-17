import React from 'react';
import { createRoot } from 'react-dom/client';

import {
    type ModuleMountFunction,
    type ModuleUnmountFunction,
    type WindowWithModule,
} from '@alfalab/scripts-modules';

import { ServerStateModuleCompat } from '#/modules/server-state-module-compat/server-state-module-compat';

let root: ReturnType<typeof createRoot>;

const mountModule: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    console.log('ServerStateModuleCompat: mount', { runParams, serverState });

    root = createRoot(targetNode);
    root.render(<ServerStateModuleCompat serverState={serverState} runParams={runParams} />);
};

const unmountModule: ModuleUnmountFunction = () => {
    console.log('ServerStateModuleCompat: cleanup');

    root?.unmount();
};

(window as WindowWithModule).ServerStateModuleCompat = {
    mount: mountModule,
    unmount: unmountModule,
};
