import fs from 'fs';
import os from 'os';
import path from 'path';

import ts from 'typescript';

import {
    getDefaultAppConfig,
    getDefaultAppContext,
} from '../../../../configs/app-configs/get-defaults';
import { type AppContextWithConfigs } from '../../../../configs/app-configs/types';
import { consumerSource, factorySources } from '../__fixtures__/consumer';
import { buildModuleContracts } from '../build-module-contracts';

describe('module contracts', () => {
    let root: string;
    let cwd: string;
    let config: AppContextWithConfigs;

    const write = (filename: string, content: string) => {
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, content);
    };
    const link = (source: string, target: string) => {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.symlinkSync(source, target, 'dir');
    };
    const output = () => path.join(cwd, '.build/module-contracts');
    const readPackage = () =>
        JSON.parse(fs.readFileSync(path.join(output(), 'package.json'), 'utf8'));

    beforeEach(() => {
        root = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-contract-test-'));
        cwd = path.join(root, 'provider');
        write(
            path.join(cwd, 'package.json'),
            JSON.stringify({
                name: 'provider',
                version: '1.2.3',
                dependencies: {
                    '@fixture/dto': '^2.0.0',
                    '@alfalab/scripts-modules': 'workspace:*',
                },
            }),
        );
        write(
            path.join(cwd, 'tsconfig.json'),
            JSON.stringify({
                compilerOptions: {
                    strict: true,
                    target: 'es2022',
                    module: 'esnext',
                    moduleResolution: 'bundler',
                    noEmit: true,
                    types: [],
                    paths: { '#/*': ['./src/*'] },
                },
                include: ['src/**/*.ts', 'global.d.ts'],
            }),
        );
        write(path.join(cwd, 'global.d.ts'), 'declare module "*.css";');
        write(
            path.join(cwd, 'src/params.ts'),
            'export type Params = { clientId: string; width: number };',
        );
        write(
            path.join(root, 'dto/package.json'),
            JSON.stringify({ name: '@fixture/dto', version: '2.0.1', types: './index.d.ts' }),
        );
        write(path.join(root, 'dto/index.d.ts'), 'export type Credit = { balance: number };');
        link(
            path.dirname(require.resolve('typescript/package.json')),
            path.join(cwd, 'node_modules/typescript'),
        );
        link(path.join(root, 'dto'), path.join(cwd, 'node_modules/@fixture/dto'));
        link(
            path.dirname(require.resolve('@alfalab/scripts-modules/package.json')),
            path.join(cwd, 'node_modules/@alfalab/scripts-modules'),
        );
        write(
            path.join(cwd, 'src/credit.ts'),
            `
            import type { Params } from '#/params';
            import type { Credit } from '@fixture/dto';
            import './styles.css';
            export function mount(target: HTMLElement, params: Params, state: { baseUrl: string; hostAppId: string; credit: Credit }): void {}
            export function unmount(): void {}
        `,
        );
        write(
            path.join(cwd, 'src/default.ts'),
            `
            import { createReactModule, type ReactModuleProps } from '@alfalab/scripts-modules/react';
            export default createReactModule({ Component: (props: ReactModuleProps<{ theme: 'light' | 'dark' }>) => null });
        `,
        );
        write(
            path.join(cwd, 'src/factory.ts'),
            `
            export default (params: { account: string }, state: { baseUrl: string; hostAppId: string; amount: number }) => ({ balance: state.amount });
        `,
        );
        config = {
            ...getDefaultAppConfig(),
            ...getDefaultAppContext(),
            cwd,
            version: '1.2.3',
            tsconfig: path.join(cwd, 'tsconfig.json'),
            serverOutputPath: path.join(cwd, '.build'),
            modules: {
                shared: {},
                exposes: {
                    Credit: './src/credit',
                    ReactCredit: './src/default',
                    Factory: './src/factory',
                },
                types: { packageName: '@fixture/contracts' },
            },
        };
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        fs.rmSync(root, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    it.each(Object.entries(factorySources))(
        'checks a portable %s factory without producer sources',
        (_kind, source) => {
            write(path.join(cwd, 'src/factory.ts'), source);
            const directory = buildModuleContracts(config);

            expect(directory).toBe(output());
            if (!directory) throw new Error('Expected contracts');
            const metadata = readPackage();

            expect(metadata).toMatchObject({
                name: '@fixture/contracts',
                version: '1.2.3',
                peerDependencies: { '@fixture/dto': '^2.0.0' },
            });
            expect(metadata).not.toHaveProperty('dependencies');
            expect(metadata.peerDependencies['@alfalab/scripts-modules']).toMatch(
                /^\^\d+\.\d+\.0$/,
            );
            expect(buildModuleContracts(config)).toBe(directory);
            expect(
                fs.readFileSync(path.join(directory, 'declarations/src/credit.d.ts'), 'utf8'),
            ).not.toContain('#/');
            const consumer = path.join(root, 'consumer');

            fs.cpSync(directory, path.join(consumer, 'node_modules/@fixture/contracts'), {
                recursive: true,
            });
            link(path.join(root, 'dto'), path.join(consumer, 'node_modules/@fixture/dto'));
            link(
                path.dirname(require.resolve('@alfalab/scripts-modules/package.json')),
                path.join(consumer, 'node_modules/@alfalab/scripts-modules'),
            );
            write(path.join(consumer, 'package.json'), '{"type":"module"}');
            write(path.join(consumer, 'index.ts'), consumerSource);
            fs.rmSync(cwd, { recursive: true, force: true });
            const program = ts.createProgram([path.join(consumer, 'index.ts')], {
                noEmit: true,
                strict: true,
                skipLibCheck: false,
                types: [],
                target: ts.ScriptTarget.ESNext,
                module: ts.ModuleKind.NodeNext,
                moduleResolution: ts.ModuleResolutionKind.NodeNext,
            });
            const diagnostics = ts.getPreEmitDiagnostics(program);

            expect(
                diagnostics.map((diagnostic) =>
                    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
                ),
            ).toEqual([]);
        },
        60000,
    );

    it('names createReactModule types without the main package entry in the program', () => {
        if (!config.modules) throw new Error('Expected modules');
        config.modules.exposes = { ReactCredit: './src/default' };

        expect(buildModuleContracts(config)).toBe(output());
    }, 30000);

    it('removes a previous package when generation fails', () => {
        buildModuleContracts(config);
        write(path.join(cwd, 'src/credit.ts'), 'export const broken: number = "text";');

        expect(() => buildModuleContracts(config)).toThrow('not assignable');
        expect(fs.existsSync(output())).toBe(false);
    }, 30000);

    it('uses modules.types.version instead of the application version', () => {
        if (!config.modules?.types) throw new Error('Expected modules.types');
        config.modules.types.version = '2.0.0-rc.1';
        config.version = 'next';
        buildModuleContracts(config);

        expect(readPackage().version).toBe('2.0.0-rc.1');
    }, 30000);

    it('requires a SemVer package version', () => {
        config.version = 'next';

        expect(() => buildModuleContracts(config)).toThrow('SemVer');
    });

    it('rejects a non-SemVer override even if the application version is valid', () => {
        if (!config.modules?.types) throw new Error('Expected modules.types');
        config.modules.types.version = 'next';

        expect(() => buildModuleContracts(config)).toThrow('SemVer');
    });

    it('ignores unrelated declaration conflicts in provider environment types', () => {
        const tsconfig = JSON.parse(fs.readFileSync(config.tsconfig as string, 'utf8'));
        const environment = path.join(cwd, 'node_modules/@fixture/environment');

        tsconfig.compilerOptions.types = ['@fixture/environment'];
        write(config.tsconfig as string, JSON.stringify(tsconfig));
        write(
            path.join(environment, 'package.json'),
            JSON.stringify({
                name: '@fixture/environment',
                version: '1.0.0',
                types: './index.d.ts',
            }),
        );
        write(
            path.join(environment, 'index.d.ts'),
            `
            interface EnvironmentBase { version: string }
            interface LegacyEnvironment extends EnvironmentBase { version: number }
        `,
        );

        expect(() => buildModuleContracts(config)).not.toThrow();
    }, 30000);

    it('does not read or generate anything when disabled', () => {
        if (!config.modules) throw new Error('Expected modules');
        config.modules.types = false;
        fs.rmSync(cwd, { recursive: true, force: true });

        expect(buildModuleContracts(config)).toBeUndefined();
    });

    it('still rejects invalid declarations included in the public contract', () => {
        write(
            path.join(cwd, 'src/params.d.ts'),
            `
            interface BaseParams { clientId: string }
            export interface Params extends BaseParams { clientId: number; width: number }
        `,
        );
        fs.rmSync(path.join(cwd, 'src/params.ts'));

        expect(() => buildModuleContracts(config)).toThrow('incorrectly extends');
        expect(fs.existsSync(output())).toBe(false);
    }, 30000);

    it('rejects declarations relying on unexported provider globals and removes them', () => {
        const tsconfig = JSON.parse(fs.readFileSync(config.tsconfig as string, 'utf8'));

        tsconfig.compilerOptions.types = ['node'];
        write(config.tsconfig as string, JSON.stringify(tsconfig));
        link(
            path.dirname(require.resolve('@types/node/package.json')),
            path.join(cwd, 'node_modules/@types/node'),
        );
        write(path.join(cwd, 'src/credit.ts'), 'export type State = NodeJS.Process;');

        expect(() => buildModuleContracts(config)).toThrow('без настроек проекта микрофронта');
        expect(fs.existsSync(output())).toBe(false);
    }, 30000);
});
