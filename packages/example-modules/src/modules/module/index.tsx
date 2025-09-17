import React from 'react';
import { createRoot } from 'react-dom/client';

import { type ModuleMountFunction, type ModuleUnmountFunction } from '@alfalab/scripts-modules';

import { Module } from './example-module';

let root: ReturnType<typeof createRoot>;

export const mount: ModuleMountFunction = (targetNode, runParams, serverState) => {
    console.log('Module: mount', { runParams, serverState });
    if (!targetNode) {
        throw new Error('Target node is not defined for module');
    }

    root = createRoot(targetNode);

    root.render(<Module />);
};
export const unmount: ModuleUnmountFunction = () => {
    console.log('Module: unmount');

    root?.unmount();
};
