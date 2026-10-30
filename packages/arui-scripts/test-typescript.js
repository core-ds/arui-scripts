/* eslint-disable @typescript-eslint/no-var-requires, global-require */
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { rspack } = require('@rspack/core');

const { checkTypeScriptWatch } = require('./test-typescript-watch');

// Pass an installed TypeScript package directory; CI installs each version outside the workspace.
const typescriptPath = fs.realpathSync(process.argv[2]);
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-typescript-integration-'));
// TS 7.0.2 ignores shallow watch roots such as /tmp/<fixture>/src on Linux.
// https://github.com/microsoft/TypeScript/issues/64425
const project = path.join(temporaryRoot, 'workspace', 'project');
const originalCwd = process.cwd();

function write(filename, content) {
    const destination = path.join(project, filename);

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
}

async function main() {
    write('package.json', JSON.stringify({ name: 'typescript-integration' }));
    write('src/index.ts', 'export const value: number = 42;');
    write('arui-scripts.config.ts', 'export default { serverPort: 4321 };');
    write(
        'tsconfig.json',
        JSON.stringify({
            extends: path.join(__dirname, 'tsconfig.json'),
            compilerOptions: { types: [], skipLibCheck: true },
            include: ['src/**/*.ts'],
            exclude: ['src/__tests__'],
        }),
    );
    fs.mkdirSync(path.join(project, 'node_modules'), { recursive: true });
    fs.symlinkSync(typescriptPath, path.join(project, 'node_modules/typescript'), 'junction');
    process.chdir(project);

    const { configs } = require('./build/configs/app-configs');
    const { validateConfig } = require('./build/configs/app-configs/validate-config');
    const { getProjectTypeScript } = require('./build/configs/util/typescript');
    const { getTscWatchCommand } = require('./build/commands/util/tsc');
    const { createSingleClientRspackConfig } = require('./build/configs/rspack.client');
    const { swcClientConfig } = require('./build/configs/swc');
    const jestSettings = require('./build/configs/jest/settings');
    const { version } = getProjectTypeScript(project);

    assert.equal(configs.serverPort, 4321);
    const watchCommand = getTscWatchCommand(configs.tsconfig, project);
    const [tsc] = watchCommand;
    const versionResult = spawnSync(process.execPath, [tsc, '--version'], { encoding: 'utf8' });

    assert.equal(versionResult.status, 0, versionResult.stderr);
    assert(versionResult.stdout.includes(version));
    ['codeLoader', 'jestCodeTransformer'].forEach((key) => {
        const validate = () => validateConfig({ ...configs, [key]: 'tsc' });

        if (Number.parseInt(version, 10) >= 7) {
            assert.throws(validate, new RegExp(`${key}.*swc.*babel`));
        } else {
            assert.doesNotThrow(validate);
        }
    });

    async function compile(valid) {
        const original = createSingleClientRspackConfig('prod', {
            main: [path.join(project, 'src/index.ts')],
        });
        const checker = original.plugins.find(
            (plugin) => plugin?.constructor.name === 'TsCheckerRspackPlugin',
        );

        assert(checker, 'Production type checking must be enabled');
        const compiler = rspack({
            mode: 'development',
            context: project,
            entry: './src/index.ts',
            output: { path: path.join(project, '.build'), filename: 'out.js' },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: require.resolve('swc-loader'),
                        options: swcClientConfig,
                    },
                ],
            },
            plugins: [checker],
        });

        try {
            const stats = await new Promise((resolve, reject) => {
                compiler.run((error, result) => (error ? reject(error) : resolve(result)));
            });
            const { errors } = stats.toJson({ all: false, errors: true });

            assert.equal(stats.hasErrors(), !valid, JSON.stringify(errors));
            if (!valid) assert(errors.some((error) => /TS2322/.test(error.message)));
        } finally {
            await new Promise((resolve, reject) => {
                compiler.close((error) => (error ? reject(error) : resolve()));
            });
        }
    }

    await compile(true);
    write('src/index.ts', 'export const value: number = "wrong";');
    await compile(false);
    write('src/index.ts', 'export const value: number = 42;');
    await checkTypeScriptWatch(watchCommand, project);
    write('src/index.ts', 'export const value: number = 42;');
    write(
        'src/__tests__/value.tests.ts',
        'import { value } from "../index"; test("SWC transforms TypeScript", () => expect(value).toBe(42));',
    );
    const jestResult = spawnSync(
        process.execPath,
        [
            require.resolve('jest/bin/jest'),
            '--runInBand',
            '--config',
            JSON.stringify({ ...jestSettings, rootDir: project, cache: false }),
        ],
        { encoding: 'utf8', timeout: 30000 },
    );

    assert.equal(jestResult.status, 0, `${jestResult.stdout}\n${jestResult.stderr}`);
    console.log(
        `TypeScript ${version}: config loading, CLI/watch, SWC, Rspack diagnostics and Jest passed`,
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => {
        process.chdir(originalCwd);
        fs.rmSync(temporaryRoot, { recursive: true, force: true });
    });
