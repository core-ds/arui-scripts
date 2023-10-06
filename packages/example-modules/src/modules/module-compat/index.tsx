import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import type { WindowWithModule } from '@alfalab/scripts-modules';
import { MountableModule } from '@alfalab/scripts-modules/src/module-loader/module-types';

import { CompatModule } from '#/modules/module-compat/compat-module';

import './styles.css';

type ModuleType = MountableModule<Record<string, unknown>>;

const ModuleCompat: ModuleType = {
    mount: (targetNode, runParams) => {
        console.log('ModuleCompat: mount', { runParams }, targetNode);

        render(<CompatModule />, targetNode);
    },
    unmount: (targetNode) => {
        console.log('ModuleCompat: cleanup');

        unmountComponentAtNode(targetNode);
    },
};

(window as WindowWithModule<ModuleType>).ModuleCompat = ModuleCompat;
