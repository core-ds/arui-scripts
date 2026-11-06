import { type Configuration, rspack } from '@rspack/core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { createSharedGroup } from '../create-shared-group';

describe('createSharedGroup federation', () => {
    let directory: string;

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), 'shared-group-federation-'));
    });
    afterEach(() => rmSync(directory, { recursive: true, force: true }));

    function write(path: string, content: string) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, content);
    }

    function app(name: string, reactVersion: string, libraryVersion: string) {
        const context = join(directory, name);

        write(join(context, 'package.json'), JSON.stringify({ name }));
        const install = (dependency: string, version: string, files: Record<string, string>) => {
            const root = join(context, 'node_modules', dependency);

            write(join(root, 'package.json'), JSON.stringify({ name: dependency, version }));
            Object.entries(files).forEach(([file, contents]) => write(join(root, file), contents));
        };

        install('react', reactVersion, { 'index.js': `module.exports = { owner: '${name}' };` });
        install('react-dom', reactVersion, {
            'index.js': "module.exports = { runtime: require('react') };",
            'client.js': "module.exports = require('react-dom');",
        });
        install('@company/ui', libraryVersion, {
            'button.js': `module.exports = { runtime: require('react'), owner: '${name}' };`,
            'unused.js': "throw new Error('Unused component must not be bundled');",
        });

        return {
            context,
            shared: createSharedGroup({
                packageJson: join(context, 'package.json'),
                runtime: ['react', 'react-dom'],
                libraries: { '@company/ui/': { requiredVersion: '^42.0.0' } },
                eager: name === 'host',
            }),
        };
    }

    async function build(config: Configuration) {
        const compiler = rspack({
            mode: 'development',
            target: 'node',
            devtool: false,
            optimization: { minimize: false },
            ...config,
        });

        return new Promise<string>((resolve, reject) => {
            compiler.run((error, stats) => {
                compiler.close((closeError) => {
                    if (error || closeError || !stats || stats.hasErrors()) {
                        reject(error || closeError || new Error(stats?.toString()));
                    } else {
                        resolve(stats.toString({ all: false, modules: true }));
                    }
                });
            });
        });
    }

    it.each([
        ['18.3.1', '42.2.1', true, true, true],
        ['19.0.0', '42.2.1', false, false, true],
        ['18.3.1', '43.0.0', true, false, true],
        ['18.3.1', '42.2.1', true, false, false],
    ])(
        'selects coherent runtime and library for React %s / UI %s',
        async (reactVersion, libraryVersion, sharedRuntime, sharedButton, hostHasButton) => {
            const host = app('host', '18.3.1', '42.2.1');
            const remote = app('remote', reactVersion as string, libraryVersion as string);

            // An incompatible library must use its local fallback with the shared runtime.
            if (libraryVersion === '43.0.0') {
                remote.shared['@company/ui/'].requiredVersion = '^43.0.0';
            }
            write(
                join(remote.context, 'module.js'),
                `
            module.exports = {
                runtime: require('react'),
                renderer: require('react-dom/client'),
                button: require('@company/ui/button'),
            };
        `,
            );
            const remoteEntry = join(remote.context, 'dist', 'remote.js');

            await build({
                context: remote.context,
                entry: {},
                output: {
                    path: dirname(remoteEntry),
                    uniqueName: 'remote',
                    library: { type: 'commonjs-module' },
                },
                plugins: [
                    new rspack.container.ModuleFederationPlugin({
                        implementation: require.resolve('@module-federation/runtime-tools'),
                        name: 'remote',
                        filename: 'remote.js',
                        library: { type: 'commonjs-module' },
                        shared: remote.shared,
                        exposes: { './module': './module.js' },
                    }),
                ],
            });
            write(
                join(host.context, 'entry.js'),
                `
            const runtime = require('react');
            const renderer = require('react-dom/client');
            const button = ${hostHasButton ? "require('@company/ui/button')" : 'undefined'};
            module.exports = (async () => {
                await __webpack_init_sharing__('default');
                const container = require('remote-container');
                await container.init(__webpack_share_scopes__.default);
                const remote = (await container.get('./module'))();
                return {
                    sharedRuntime: runtime === remote.runtime,
                    sharedButton: button === remote.button,
                    hostCoherent: !button || button.runtime === renderer.runtime,
                    remoteCoherent: remote.button.runtime === remote.renderer.runtime,
                };
            })();
        `,
            );
            const hostEntry = join(host.context, 'dist', 'host.js');
            const modules = await build({
                context: host.context,
                entry: './entry.js',
                output: {
                    path: dirname(hostEntry),
                    filename: 'host.js',
                    uniqueName: 'host',
                    library: { type: 'commonjs-module' },
                },
                externals: { 'remote-container': `commonjs ${remoteEntry}` },
                plugins: [
                    new rspack.container.ModuleFederationPlugin({
                        implementation: require.resolve('@module-federation/runtime-tools'),
                        name: 'host',
                        shared: host.shared,
                    }),
                ],
            });

            expect(modules).not.toContain('unused.js');
            if (!hostHasButton) {
                expect(modules).not.toContain('@company/ui/button');
            }
            const output = execFileSync(
                process.execPath,
                [
                    '-e',
                    `
            require(${JSON.stringify(
                hostEntry,
            )}).then(result => console.log(JSON.stringify(result)))
                .catch(error => { console.error(error); process.exitCode = 1; });
        `,
                ],
                { encoding: 'utf8' },
            );

            expect(JSON.parse(output.trim())).toEqual({
                sharedRuntime,
                sharedButton,
                hostCoherent: true,
                remoteCoherent: true,
            });
        },
        30000,
    );
});
