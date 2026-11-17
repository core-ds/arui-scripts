import fs from 'fs';
import path from 'path';

import { checkPackedConsumer, createPortableProject } from '../__fixtures__/portable-contract';

describe('module format of published contracts', () => {
    let project: ReturnType<typeof createPortableProject>;

    beforeEach(() => {
        project = createPortableProject({ module: 'nodenext', moduleResolution: 'nodenext' });
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        fs.rmSync(project.root, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    it('supports the documented import type in a CommonJS Node16 host', async () => {
        project.write('package.json', '{"name":"provider","version":"1.0.0","type":"module"}');
        project.write('src/index.ts', 'export const factory = (width: number) => width;');

        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const width: number = widget.factory(123);
            // @ts-expect-error The ESM entrypoint retains its types in a CommonJS host.
            widget.factory('123');
        `,
            {},
            'commonjs-node16',
        );
    }, 30000);

    it('declares dependencies available only through exports.import', async () => {
        project.write(
            'package.json',
            JSON.stringify({
                name: 'provider',
                version: '1.0.0',
                type: 'module',
                dependencies: { 'import-only': '1.0.0' },
            }),
        );
        project.write(
            '../import-only/package.json',
            JSON.stringify({
                name: 'import-only',
                version: '1.0.0',
                exports: { import: './index.d.mts' },
            }),
        );
        project.write('../import-only/index.d.mts', "export type Mode = 'import';");
        const dependency = path.join(project.root, 'import-only');

        fs.symlinkSync(dependency, path.join(project.cwd, 'node_modules/import-only'), 'dir');
        project.write(
            'src/index.ts',
            "import type { Mode } from 'import-only'; export const factory = (mode: Mode) => mode;",
        );
        const manifest = await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const mode: 'import' = widget.factory('import');
            // @ts-expect-error The installed dependency defines a literal type.
            widget.factory('require');
        `,
            { 'import-only': dependency },
        );

        expect(manifest.peerDependencies).toEqual({ 'import-only': '^1.0.0' });
    }, 30000);

    it('rewrites a conditional package import using the ESM provider branch', async () => {
        project.write(
            'package.json',
            JSON.stringify({
                name: 'provider',
                version: '1.0.0',
                type: 'module',
                imports: { '#mode': { import: './src/esm.ts', require: './src/cjs.cts' } },
            }),
        );
        project.write('src/esm.ts', "export type Mode = 'import';");
        project.write('src/cjs.cts', "export type Mode = 'require';");
        project.write(
            'src/index.ts',
            "import type { Mode } from '#mode'; export const factory = (mode: Mode) => mode;",
        );

        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const mode: 'import' = widget.factory('import');
            // @ts-expect-error The local import must keep its ESM branch.
            widget.factory('require');
        `,
        );
    }, 30000);

    it.each([
        ['nodenext', 'commonjs', 'require', 'import'],
        ['nodenext', 'module', 'import', 'require'],
        ['node18', 'commonjs', 'require', 'import'],
        ['node20', 'commonjs', 'require', 'import'],
    ])(
        'preserves external types for module=%s and package type=%s',
        async (module, type, expected, rejected) => {
            const config = JSON.parse(fs.readFileSync(project.config.tsconfig, 'utf8'));

            config.compilerOptions.module = module;
            delete config.compilerOptions.moduleResolution;
            project.write('tsconfig.json', JSON.stringify(config));
            project.write(
                'package.json',
                JSON.stringify({
                    name: 'provider',
                    version: '1.0.0',
                    type,
                    dependencies: { dual: '1.0.0' },
                }),
            );
            project.write(
                '../dual/package.json',
                JSON.stringify({
                    name: 'dual',
                    version: '1.0.0',
                    exports: { '.': { import: './esm.d.mts', require: './cjs.d.cts' } },
                }),
            );
            project.write('../dual/esm.d.mts', "export type Mode = 'import';");
            project.write('../dual/cjs.d.cts', "export type Mode = 'require';");
            const dual = path.join(project.root, 'dual');

            fs.symlinkSync(dual, path.join(project.cwd, 'node_modules/dual'), 'dir');
            project.write(
                'src/index.ts',
                `
            import type { Mode } from 'dual';
            const valid: Mode = '${expected}';
            export function factory(params: { mode: Mode }) { return params.mode; }
        `,
            );
            await checkPackedConsumer(
                project,
                `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const mode: '${expected}' = widget.factory({ mode: '${expected}' });
            // @ts-expect-error Publishing must not switch the import/require condition.
            widget.factory({ mode: '${rejected}' });
        `,
                { dual },
            );
        },
        30000,
    );

    it.each([
        ['nodenext', 'nodenext'],
        ['commonjs', 'node10'],
    ])(
        'preserves export assignment with module=%s',
        async (module, moduleResolution) => {
            const config = JSON.parse(fs.readFileSync(project.config.tsconfig, 'utf8'));

            config.compilerOptions = {
                ...config.compilerOptions,
                module,
                moduleResolution,
                ignoreDeprecations: '6.0',
            };
            project.write('tsconfig.json', JSON.stringify(config));
            project.write(
                'src/index.ts',
                'function factory(params: { width: number }) { return params.width; } export = factory;',
            );
            await checkPackedConsumer(
                project,
                `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const factory: ModuleContracts['Widget'];
            const width: number = factory({ width: 300 });
            // @ts-expect-error The CommonJS function must retain its parameter type.
            factory({ width: '300' });
        `,
            );
        },
        30000,
    );
});
