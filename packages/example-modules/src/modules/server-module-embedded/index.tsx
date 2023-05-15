import type { ModuleMountFunction, ModuleUnmountFunction, WindowWithMountableModule } from '@arui-scripts/modules';
import ReactDOM from 'react-dom';
import React from 'react';
import { ServerModuleEmbedded } from '#/modules/server-module-embedded/server-module-embedded';

const mountModule: ModuleMountFunction = (moduleId, params, targetNode) => {
    console.log('ServerModuleEmbedded: mount', params);

    if (!targetNode) {
        return;
    }

    ReactDOM.render(<ServerModuleEmbedded {...params} />, targetNode);
};

const unmountModule: ModuleUnmountFunction = (targetNode) => {
    console.log('ServerModuleEmbedded: cleanup');

    if (targetNode) {
        ReactDOM.unmountComponentAtNode(targetNode);
    }
};

(window as WindowWithMountableModule).ServerModuleEmbedded = {
    mount: mountModule,
    unmount: unmountModule,
};
