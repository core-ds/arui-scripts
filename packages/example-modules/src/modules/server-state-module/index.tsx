import React from 'react';
import { createRoot } from 'react-dom/client';

import { type ModuleMountFunction, type ModuleUnmountFunction } from '@alfalab/scripts-modules';

import { ServerStateModule } from './server-state-module';

let root: ReturnType<typeof createRoot>;

const mount: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    root = createRoot(targetNode);
    console.log('ServerStateModule: mount', { runParams, serverState });
    root.render(<ServerStateModule runParams={runParams} serverState={serverState} />);
};
const unmount: ModuleUnmountFunction = () => {
    console.log('ServerStateModule: unmount');

    root?.unmount();
};

// нужно для демонстрации работы с дефолтными экспортами
/* eslint-disable import/no-default-export */
export default {
    mount,
    unmount,
};
