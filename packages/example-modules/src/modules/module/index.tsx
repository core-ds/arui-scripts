import React from 'react';
import ReactDOM from 'react-dom';

import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';

import { Module } from './example-module';
import { createBrowserHistory } from 'history';

export const mount: ModuleMountFunction<Record<string, string>> = (targetNode, runParams, serverState) => {
    console.log('Module: mount', { runParams, serverState });
    if (!targetNode) {
        throw new Error('Target node is not defined for module');
    }

    const history = createBrowserHistory({ basename: runParams?.contextRoot ?? '/' });

    ReactDOM.render(<Module history={history} />, targetNode);
};
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('Module: unmount');
    if (!targetNode) {
        return;
    }

    ReactDOM.unmountComponentAtNode(targetNode);
};
