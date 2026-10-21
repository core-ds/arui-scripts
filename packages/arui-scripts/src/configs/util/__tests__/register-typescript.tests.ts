/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';

import * as swc from '@swc/core';

import { compileTypescript, registerTypescript } from '../register-typescript';

// jest подменяет `require`, но не сам загрузчик Node, поэтому конфиги в интеграционном тесте грузим через `Module._load`
const nodeModule = Module as unknown as {
    _extensions: NodeJS.RequireExtensions;
    _cache: Record<string, unknown>;
    _load: (request: string, parent: null, isMain: boolean) => Record<string, unknown>;
};

function execute(code: string) {
    const moduleExports: Record<string, unknown> = {};

    // Выполняем результат компиляции как обычный CommonJS-модуль
    // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
    new Function('exports', 'require', 'module', code)(moduleExports, require, {
        exports: moduleExports,
    });

    return moduleExports;
}

describe('register-typescript', () => {
    describe('compileTypescript', () => {
        it('should strip types and produce a CommonJS module with default export', () => {
            const code = compileTypescript(
                [
                    'interface Config { name: string }',
                    "const config: Config = { name: 'app' };",
                    'export default config;',
                ].join('\n'),
                '/project/arui-scripts.config.ts',
            );

            const result = execute(code);

            expect(result.__esModule).toBe(true);
            expect(result.default).toEqual({ name: 'app' });
        });

        it('should keep enums as runtime values', () => {
            const code = compileTypescript(
                "export enum Mode { Dev = 'dev', Prod = 'prod' }",
                '/project/mode.ts',
            );

            expect(execute(code).Mode).toEqual({ Dev: 'dev', Prod: 'prod' });
        });

        it('should not require modules that are imported only as types', () => {
            const code = compileTypescript(
                [
                    "import { type Foo } from './missing-foo';",
                    "import type { Bar } from './missing-bar';",
                    'export const value: Foo | Bar | number = 1;',
                ].join('\n'),
                '/project/types-only.ts',
            );

            expect(execute(code).value).toBe(1);
        });

        it('should compile tsx files', () => {
            const code = compileTypescript(
                'export default () => <div />;',
                '/project/component.tsx',
            );

            expect(code).toContain('createElement');
        });

        it('should ignore swc configs of the project', () => {
            const transformSync = jest.spyOn(swc, 'transformSync');

            compileTypescript('export default 1;', '/project/arui-scripts.config.ts');

            expect(transformSync).toHaveBeenCalledWith(
                'export default 1;',
                expect.objectContaining({
                    filename: '/project/arui-scripts.config.ts',
                    swcrc: false,
                    configFile: false,
                }),
            );

            transformSync.mockRestore();
        });
    });

    describe('registerTypescript', () => {
        it('should register handlers for .ts and .tsx extensions', () => {
            const extensions = {} as NodeJS.RequireExtensions;

            registerTypescript(extensions);

            expect(Object.keys(extensions)).toEqual(['.ts', '.tsx']);
        });

        describe('with real file system', () => {
            let tmpDir: string;
            const originalHandlers = {
                '.ts': nodeModule._extensions['.ts'],
                '.tsx': nodeModule._extensions['.tsx'],
            };

            beforeEach(() => {
                tmpDir = fs.mkdtempSync(
                    path.join(os.tmpdir(), 'arui-scripts-register-typescript-'),
                );
            });

            afterEach(() => {
                Object.entries(originalHandlers).forEach(([extension, handler]) => {
                    if (handler) {
                        nodeModule._extensions[extension] = handler;
                    } else {
                        delete nodeModule._extensions[extension];
                    }
                });
                Object.keys(nodeModule._cache)
                    .filter((filename) => filename.startsWith(tmpDir))
                    .forEach((filename) => delete nodeModule._cache[filename]);
                fs.rmSync(tmpDir, { recursive: true, force: true });
            });

            it('should compile the file and pass the result to the module', () => {
                const file = path.join(tmpDir, 'settings.ts');
                const fakeModule = { _compile: jest.fn() };

                fs.writeFileSync(file, 'export default { port: 8080 as number };');
                const extensions = {} as NodeJS.RequireExtensions;

                registerTypescript(extensions);
                const handler = extensions['.ts'];

                handler?.(fakeModule as unknown as NodeJS.Module, file);

                expect(fakeModule._compile).toHaveBeenCalledWith(
                    expect.stringContaining('8080'),
                    file,
                );
            });

            it('should let Node require typescript files, including extensionless imports of neighbours', () => {
                fs.writeFileSync(
                    path.join(tmpDir, 'helper.ts'),
                    'export const port: number = 8080;\n',
                );
                fs.writeFileSync(
                    path.join(tmpDir, 'arui-scripts.config.ts'),
                    [
                        "import { type PackageSettings } from 'arui-scripts';",
                        "import { port } from './helper';",
                        '',
                        'const config: Partial<PackageSettings> = { serverPort: port };',
                        '',
                        'export default config;',
                    ].join('\n'),
                );

                registerTypescript(nodeModule._extensions);
                // без расширения, как это делает tryResolve при поиске конфига приложения
                const loaded = nodeModule._load(
                    path.join(tmpDir, 'arui-scripts.config'),
                    null,
                    false,
                );

                expect(loaded.__esModule).toBe(true);
                expect(loaded.default).toEqual({ serverPort: 8080 });
            });
        });
    });
});
