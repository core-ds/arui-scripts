import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import {
    type ModuleMountFunction,
    type ModuleUnmountFunction,
    type WindowWithModule,
} from '@alfalab/scripts-modules';

import { ServerStateModuleCompat } from '#/modules/server-state-module-compat/server-state-module-compat';

let root: ReturnType<typeof createRoot>;

const renderModule = (runParams: Record<string, unknown>, serverState: Record<string, unknown>) => {
    root.render(<ServerStateModuleCompat serverState={serverState} runParams={runParams} />);
};

const mountModule: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    console.log('ServerStateModuleCompat: mount', { runParams, serverState });

    root = createRoot(targetNode);
    renderModule(runParams, serverState);
};

const hydrateModule: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    console.log('ServerStateModuleCompat: hydrate', { runParams, serverState });

    root = hydrateRoot(
        targetNode,
        <ServerStateModuleCompat serverState={serverState} runParams={runParams} />,
    );
};

const updateModule: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    console.log('ServerStateModuleCompat: update', { runParams, serverState }, targetNode);

    renderModule(runParams, serverState);
};

const unmountModule: ModuleUnmountFunction = () => {
    console.log('ServerStateModuleCompat: cleanup');

    root?.unmount();
};

(window as WindowWithModule).ServerStateModuleCompat = {
    mount: mountModule,
    hydrate: hydrateModule,
    update: updateModule,
    unmount: unmountModule,
};
