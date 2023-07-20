import type { ModuleMountFunction, ModuleUnmountFunction } from '@alfalab/scripts-modules';
import ReactDOM from 'react-dom';
import React from 'react';
import { ServerModuleEmbedded } from '#/modules/server-module-embedded/server-module-embedded';

__webpack_public_path__ = 'http://localhost:8082/assets/'

const mountModule: ModuleMountFunction<any, any> = (targetNode, runParams, serverState) => {
    console.log('ServerModuleEmbedded: mount', { runParams, serverState });

    ReactDOM.render(<ServerModuleEmbedded serverState={serverState} runParams={runParams} />, targetNode);
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerModuleEmbedded: cleanup');

    if (targetNode) {
        ReactDOM.unmountComponentAtNode(targetNode);
    }
};

// TODO: типизировать
(window as any).ServerModuleEmbedded = {
    mount: mountModule,
    unmount: unmountModule,
};
