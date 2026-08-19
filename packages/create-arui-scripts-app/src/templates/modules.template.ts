import { type TemplateContext } from '../types';

export function remoteModuleTemplate(): string {
    return `import React from 'react';
import { createRoot } from 'react-dom/client';

import { Typography } from '@alfalab/core-components/typography';
import { type ModuleMountFunction, type ModuleUnmountFunction } from '@alfalab/scripts-modules';

let root: ReturnType<typeof createRoot>;

function ExampleModule() {
    return (
        <Typography.Text view='primary-medium'>
            Hello from ExampleModule
        </Typography.Text>
    );
}

export const mount: ModuleMountFunction = (targetNode) => {
    if (!targetNode) {
        throw new Error('Target node is not defined for module');
    }

    root = createRoot(targetNode);
    root.render(<ExampleModule />);
};

export const unmount: ModuleUnmountFunction = () => {
    root?.unmount();
};
`;
}

export function hostModuleMounterTemplate(ctx: TemplateContext): string {
    return `import React from 'react';

import { Typography } from '@alfalab/core-components/typography';
import {
    type BaseModuleState,
    createModuleFetcher,
    createModuleLoader,
    type MountableModule,
    useModuleMounter,
} from '@alfalab/scripts-modules';

const loader = createModuleLoader<MountableModule<void, BaseModuleState>>({
    hostAppId: '${ctx.name}',
    moduleId: 'ExampleModule',
    getModuleResources: createModuleFetcher({
        // URL remote-приложения, которое отдаёт ExampleModule
        baseUrl: 'http://localhost:8082',
    }),
});

export function RemoteModule() {
    const { loadingState, targetElementRef } = useModuleMounter({ loader });

    return (
        <div>
            {loadingState === 'pending' && (
                <Typography.Text view='primary-medium'>Загрузка модуля…</Typography.Text>
            )}
            {loadingState === 'rejected' && (
                <Typography.Text view='primary-medium'>
                    Не удалось загрузить модуль. Проверьте baseUrl.
                </Typography.Text>
            )}
            <div ref={targetElementRef} />
        </div>
    );
}
`;
}
