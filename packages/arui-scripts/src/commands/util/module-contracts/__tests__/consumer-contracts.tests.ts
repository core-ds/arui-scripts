import fs from 'fs';
import path from 'path';

import { checkPackedConsumer, createPortableProject } from '../__fixtures__/portable-contract';

it('types typed mounters and factories according to the exports they execute', async () => {
    const project = createPortableProject(
        {},
        {
            Widget: './src/index',
            BadMounter: './src/bad-mounter',
            BadFactory: './src/bad-factory',
            Named: './src/named',
            NullDefault: './src/null-default',
        },
    );
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const scriptsModules = path.dirname(require.resolve('@alfalab/scripts-modules/package.json'));

    try {
        project.write(
            'package.json',
            JSON.stringify({
                name: 'provider',
                version: '1.0.0',
                dependencies: { '@alfalab/scripts-modules': 'workspace:*' },
            }),
        );
        fs.mkdirSync(path.join(project.cwd, 'node_modules/@alfalab'), { recursive: true });
        fs.symlinkSync(
            scriptsModules,
            path.join(project.cwd, 'node_modules/@alfalab/scripts-modules'),
            'dir',
        );
        project.write(
            'src/index.ts',
            `
            import type { BaseModuleState } from '@alfalab/scripts-modules';
            export default async (params: { width: number }, state: BaseModuleState) => ({
                width: params.width, baseUrl: state.baseUrl
            });
        `,
        );
        project.write(
            'src/bad-mounter.ts',
            "export default '1.0'; export function mount() {} export function unmount() {}",
        );
        project.write(
            'src/bad-factory.ts',
            "export default '1.0'; export const factory = () => 1;",
        );
        const namedFactory = `
            export function factory(params: { width: number }, state: { baseUrl: string; hostAppId: string }) {
                return params.width;
            }
            export function unmount() {}
        `;

        project.write('src/named.ts', namedFactory);
        project.write('src/null-default.ts', `${namedFactory}\nexport default null;`);

        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            import {
                createTypedModuleLoader, createModuleFetcher, useModuleFactory, useModuleMounter,
                type ModuleRunParams, type ModuleServerState,
            } from '@alfalab/scripts-modules';
            const load = createTypedModuleLoader<ModuleContracts>();
            const options = {
                hostAppId: 'host', getModuleResources: createModuleFetcher({ baseUrl: '/provider' }),
            };
            const asyncLoader = load({ ...options, moduleId: 'Widget' });
            const result = useModuleFactory({ loader: asyncLoader, runParams: { width: 100 } });
            const width: number | undefined = result.module?.width;
            // @ts-expect-error The hook exposes the awaited result.
            result.module?.then(() => undefined);
            // @ts-expect-error A string default takes precedence over named mount and unmount.
            useModuleMounter({ loader: load({ ...options, moduleId: 'BadMounter' }) });
            // @ts-expect-error A string default takes precedence over the named factory.
            useModuleFactory({ loader: load({ ...options, moduleId: 'BadFactory' }) });
            const params: ModuleRunParams<ModuleContracts['Named']> = { width: 100 };
            const state: ModuleServerState<ModuleContracts['Named']> = { baseUrl: '', hostAppId: '' };
            const fallback: ModuleRunParams<ModuleContracts['NullDefault']> = params;
            const namedLoader = load({ ...options, moduleId: 'NullDefault' });
            const fallbackResult: number | undefined = useModuleFactory({ loader: namedLoader, runParams: fallback }).module;
        `,
            { '@alfalab/scripts-modules': scriptsModules },
        );
    } finally {
        fs.rmSync(project.root, { recursive: true, force: true });
        log.mockRestore();
    }
}, 30000);
