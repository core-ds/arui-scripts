import React from 'react';
import ReactDOM from 'react-dom';

import { type ModuleMountFunction, type ModuleUnmountFunction } from '@alfalab/scripts-modules';

import { Module } from './example-module';

export const mount: ModuleMountFunction = (targetNode, runParams, serverState) => {
    console.log('Module: mount', { runParams, serverState });
    if (!targetNode) {
        throw new Error('Target node is not defined for module');
    }

    ReactDOM.render(<Module />, targetNode);
};
export const unmount: ModuleUnmountFunction = (targetNode) => {
    console.log('Module: unmount');
    if (!targetNode) {
        return;
    }

    ReactDOM.unmountComponentAtNode(targetNode);
};
