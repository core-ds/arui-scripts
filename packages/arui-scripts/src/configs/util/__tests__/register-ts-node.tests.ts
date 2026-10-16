import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import ts from 'typescript';

describe('загрузка конфигурации в Node', () => {
    let directory: string;
    let runtime: string;
    let project: string;

    function writeFile(filename: string, content: string) {
        fs.mkdirSync(path.dirname(filename), { recursive: true });
        fs.writeFileSync(filename, content);
    }

    function writeProjectFile(filename: string, content: string) {
        writeFile(path.join(project, filename), content);
    }

    function runLoader() {
        const result = spawnSync(
            process.execPath,
            [
                // Node 22.12 supports require(ESM), but still warns that it is experimental.
                '--disable-warning=ExperimentalWarning',
                '-e',
                `
                const { configs } = require(${JSON.stringify(path.join(runtime, 'app-configs'))});
                const { applyOverrides } = require(${JSON.stringify(
                    path.join(runtime, 'util/apply-overrides'),
                )});
                console.log(JSON.stringify({
                    port: configs.serverPort,
                    browsers: applyOverrides('browsers', []),
                }));
                `,
            ],
            {
                cwd: project,
                encoding: 'utf8',
                env: {
                    ...process.env,
                    NODE_PATH: require.resolve.paths('ts-node')?.join(path.delimiter),
                },
                timeout: 30000,
            },
        );

        expect({ status: result.status, stderr: result.stderr, error: result.error }).toEqual({
            status: 0,
            stderr: '',
            error: undefined,
        });

        return JSON.parse(result.stdout);
    }

    beforeAll(() => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-config-loader-'));
        runtime = path.join(directory, 'runtime');
        const configsSource = path.resolve(__dirname, '../..');
        const sourceFiles = [
            ...fs
                .readdirSync(path.join(configsSource, 'app-configs'))
                .filter((filename) => filename.endsWith('.ts'))
                .map((filename) => `app-configs/${filename}`),
            'util/register-ts-node.ts',
            'util/resolve.ts',
            'util/get-polyfills.ts',
            'util/apply-overrides.ts',
        ];

        // Compile the scripts themselves as in the package build. Project TS files are
        // compiled only by the real registration under test, in a separate Node process.
        sourceFiles.forEach((filename) => {
            const { outputText } = ts.transpileModule(
                fs.readFileSync(path.join(configsSource, filename), 'utf8'),
                {
                    compilerOptions: {
                        module: ts.ModuleKind.CommonJS,
                        target: ts.ScriptTarget.ES2016,
                        esModuleInterop: true,
                    },
                    fileName: filename,
                },
            );

            writeFile(path.join(runtime, filename.replace(/\.ts$/, '.js')), outputText);
        });
    });

    beforeEach(() => {
        project = fs.mkdtempSync(path.join(directory, 'project-'));
        writeProjectFile('package.json', JSON.stringify({ name: 'config-loader-test' }));
        writeProjectFile(
            'tsconfig.json',
            JSON.stringify({ compilerOptions: { module: 'esnext', moduleResolution: 'bundler' } }),
        );
    });

    afterAll(() => {
        fs.rmSync(directory, { recursive: true, force: true });
    });

    it.each(['config', 'overrides'])(
        'загружает TS-файл %s с вложенными импортами без расширения и require.resolve',
        (importLocation) => {
            writeProjectFile('src/nested/value.ts', 'export const port: number = 4321;');
            writeProjectFile(
                'src/helper.ts',
                "import { port } from './nested/value'; export { port };",
            );
            writeProjectFile(
                'arui-scripts.config.ts',
                importLocation === 'config'
                    ? "import { port } from './src/helper'; export default { serverPort: port };"
                    : 'export default { serverPort: 4321 };',
            );
            writeProjectFile(
                'arui-scripts.overrides.ts',
                `import { basename } from 'node:path';
             import { port } from './src/helper';
             export default { browsers: () => [String(port), basename(require.resolve('./src/helper'))] };`,
            );

            expect(runLoader()).toEqual({ port: 4321, browsers: ['4321', 'helper.ts'] });
        },
    );

    it('сохраняет загрузку JS-конфигов и overrides через module.exports', () => {
        writeProjectFile('arui-scripts.config.js', 'module.exports = { serverPort: 4322 };');
        writeProjectFile(
            'arui-scripts.overrides.js',
            "module.exports = { browsers: () => ['js'] };",
        );

        expect(runLoader()).toEqual({ port: 4322, browsers: ['js'] });
    });

    it('сохраняет загрузку нативных JS ESM-конфигов и overrides', () => {
        writeProjectFile(
            'package.json',
            JSON.stringify({ name: 'config-loader-test', type: 'module' }),
        );
        writeProjectFile('helper.js', "export const label = 'esm';");
        writeProjectFile('arui-scripts.config.js', 'export default { serverPort: 4325 };');
        writeProjectFile(
            'arui-scripts.overrides.js',
            `import { label } from './helper.js';
             export default { browsers: () => [label] };`,
        );

        expect(runLoader()).toEqual({ port: 4325, browsers: ['esm'] });
    });

    it('загружает синхронные ESM-only зависимости из TS overrides', () => {
        writeProjectFile('arui-scripts.config.ts', 'export default { serverPort: 4326 };');
        writeProjectFile(
            'node_modules/esm-only/package.json',
            JSON.stringify({ name: 'esm-only', type: 'module', exports: './index.js' }),
        );
        writeProjectFile('node_modules/esm-only/index.js', "export default 'esm-only';");
        writeProjectFile(
            'arui-scripts.overrides.ts',
            `import label from 'esm-only';
             export default { browsers: () => [label] };`,
        );

        expect(runLoader()).toEqual({ port: 4326, browsers: ['esm-only'] });
    });

    it('загружает установленные TS presets перед overrides проекта и выбирает exports.require', () => {
        writeProjectFile(
            'node_modules/corporate-preset/package.json',
            JSON.stringify({ name: 'corporate-preset' }),
        );
        writeProjectFile(
            'node_modules/corporate-preset/helper.ts',
            "export const label = 'preset';",
        );
        writeProjectFile(
            'node_modules/corporate-preset/arui-scripts.config.ts',
            'export default { serverPort: 4323 };',
        );
        writeProjectFile(
            'node_modules/corporate-preset/arui-scripts.overrides.ts',
            `import { label } from './helper';
             export default { browsers: (values: string[]) => [...values, label] };`,
        );
        writeProjectFile(
            'node_modules/conditional-dependency/package.json',
            JSON.stringify({
                name: 'conditional-dependency',
                exports: { import: './import.mjs', require: './require.cjs' },
            }),
        );
        writeProjectFile(
            'node_modules/conditional-dependency/import.mjs',
            "export default 'import';",
        );
        writeProjectFile(
            'node_modules/conditional-dependency/require.cjs',
            "module.exports = 'require';",
        );
        writeProjectFile(
            'arui-scripts.config.ts',
            "export default { presets: 'corporate-preset', serverPort: 4324 };",
        );
        writeProjectFile(
            'arui-scripts.overrides.ts',
            `import label from 'conditional-dependency';
             export default { browsers: (values: string[]) => [...values, label, 'project'] };`,
        );

        expect(runLoader()).toEqual({ port: 4324, browsers: ['preset', 'require', 'project'] });
    });
});
