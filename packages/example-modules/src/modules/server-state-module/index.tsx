// TODO: remove eslint-disable
/* eslint-disable import/no-default-export */
import React from 'react';
import ReactDOM from 'react-dom';

import { type ModuleMountFunction, type ModuleUnmountFunction } from '@alfalab/scripts-modules';

import { ServerStateModule } from './server-state-module';

const mount: ModuleMountFunction<Record<string, unknown>> = (
    targetNode,
    runParams,
    serverState,
) => {
    console.log('ServerStateModule: mount', { runParams, serverState });
    ReactDOM.render(
        <ServerStateModule runParams={runParams} serverState={serverState} />,
        targetNode,
    );
};
const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerStateModule: unmount');

    ReactDOM.unmountComponentAtNode(targetNode);
};

export default {
    mount,
    unmount,
};
