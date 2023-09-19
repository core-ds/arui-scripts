// TODO: remove eslint-disable
/* eslint-disable import/no-default-export */
import React from 'react';
import ReactDOM from 'react-dom';

import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';

import { ServerStateModule } from './ServerStateModule';

const mount: ModuleMountFunction<any, any> = (targetNode, runParams, serverState) => {
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
