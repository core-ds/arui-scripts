import React from 'react';
import { createRoot } from 'react-dom/client';

import { type WindowWithModule } from '@alfalab/scripts-modules';
import { type MountableModule } from '@alfalab/scripts-modules/src/module-loader/module-types';

import { CompatModule } from '#/modules/module-compat/compat-module';

import './styles.css';

type ModuleType = MountableModule<Record<string, unknown>>;

let root: ReturnType<typeof createRoot>;

const ModuleCompat: ModuleType = {
    mount: (targetNode, runParams) => {
        console.log('ModuleCompat: mount', { runParams }, targetNode);

        root = createRoot(targetNode);
        root.render(<CompatModule />);
    },
    unmount: () => {
        console.log('ModuleCompat: cleanup');

        root?.unmount();
    },
};

(window as WindowWithModule<ModuleType>).ModuleCompat = ModuleCompat;
