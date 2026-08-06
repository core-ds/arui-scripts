import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { type ModuleMountFunction, type ModuleUnmountFunction } from '@alfalab/scripts-modules';

import { ServerStateModule } from './server-state-module';

let root: ReturnType<typeof createRoot>;

const renderModule = (runParams: Record<string, unknown>, serverState: Record<string, unknown>) => {
    root.render(<ServerStateModule runParams={runParams} serverState={serverState} />);
};

const mount: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    root = createRoot(targetNode);
    console.log('ServerStateModule: mount', { runParams, serverState });
    renderModule(runParams, serverState);
};

const hydrate: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    console.log('ServerStateModule: hydrate', { runParams, serverState });
    root = hydrateRoot(
        targetNode,
        <ServerStateModule runParams={runParams} serverState={serverState} />,
    );
};

const update: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    console.log('ServerStateModule: update', { runParams, serverState }, targetNode);
    renderModule(runParams, serverState);
};

const unmount: ModuleUnmountFunction = () => {
    console.log('ServerStateModule: unmount');

    root?.unmount();
};

// нужно для демонстрации работы с дефолтными экспортами
/* eslint-disable import/no-default-export */
export default {
    mount,
    hydrate,
    update,
    unmount,
};
