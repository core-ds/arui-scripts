import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { constants as zlibConstants, gzipSync } from 'zlib';

import { type Compiler, rspack, type Stats } from '@rspack/core';

import { BuildSizeBudgetError, checkBuildSizeBudgets } from '../build-size-budgets';

describe('build size budgets with real Rspack output', () => {
    let directory: string;
    let stats: Stats;
    let compiler: Compiler;
    let warn: jest.SpyInstance;

    beforeAll(async () => {
        directory = await fs.mkdtemp(path.join(os.tmpdir(), 'arui-size-budgets-'));

        await fs.writeFile(
            path.join(directory, 'main.js'),
            "import './style.css'; import('./lazy.js'); console.log('main');",
        );
        await fs.writeFile(path.join(directory, 'other.js'), "console.log('other');");
        await fs.writeFile(path.join(directory, 'vendor.js'), "console.log('shared');");
        await fs.writeFile(path.join(directory, 'style.css'), '.app { color: red; }');
        await fs.writeFile(
            path.join(directory, 'lazy.js'),
            `console.log('${'large async chunk '.repeat(1000)}');`,
        );

        compiler = rspack({
            name: 'client',
            context: directory,
            mode: 'development',
            devtool: 'source-map',
            entry: {
                vendor: './vendor.js',
                main: { import: './main.js', dependOn: 'vendor' },
                other: { import: './other.js', dependOn: 'vendor' },
            },
            output: { path: path.join(directory, 'dist'), filename: '[name].js' },
            optimization: { runtimeChunk: 'single' },
            experiments: { css: true },
            module: { rules: [{ test: /\.css$/, type: 'css' }] },
        });

        stats = await new Promise<Stats>((resolve, reject) => {
            compiler.run((error, result) => {
                if (error) return reject(error);
                if (!result || result.hasErrors()) return reject(new Error(result?.toString()));

                return resolve(result);
            });
        });
    });

    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    });

    afterEach(() => jest.restoreAllMocks());

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            compiler.close((error) => (error ? reject(error) : resolve()));
        });
        await fs.rm(directory, { recursive: true, force: true });
    });

    async function sizes(files: string[]) {
        const contents = await Promise.all(
            files.map((file) => fs.readFile(path.join(directory, 'dist', file))),
        );

        return {
            raw: contents.reduce((sum, buffer) => sum + buffer.length, 0),
            gzip: contents.reduce(
                (sum, buffer) =>
                    sum + gzipSync(buffer, { level: zlibConstants.Z_BEST_COMPRESSION }).length,
                0,
            ),
        };
    }

    it.each([null, {}, { js: {} }])(
        'does no work when limits are disabled (%j)',
        async (budgets) => {
            const read = jest.spyOn(fs, 'readFile');

            await checkBuildSizeBudgets(stats, budgets);

            expect(read).not.toHaveBeenCalled();
            expect(warn).not.toHaveBeenCalled();
        },
    );

    it('counts runtime and dependOn assets once per entry, excluding async chunks and maps', async () => {
        const main = await sizes(['runtime.js', 'vendor.js', 'main.js']);
        const other = await sizes(['runtime.js', 'vendor.js', 'other.js']);
        const vendor = await sizes(['runtime.js', 'vendor.js']);

        await expect(checkBuildSizeBudgets(stats, { js: { raw: 0, gzip: 0 } })).rejects.toThrow(
            BuildSizeBudgetError,
        );

        const output = warn.mock.calls.flat().join('\n');

        for (const [name, expected] of Object.entries({ main, other, vendor })) {
            expect(output).toContain(`client/${name}: initial JS (raw) is ${expected.raw} bytes`);
            expect(output).toContain(`client/${name}: initial JS (gzip) is ${expected.gzip} bytes`);
        }

        expect(output).toContain('BUILD SIZE BUDGET EXCEEDED');
        expect(warn).toHaveBeenCalledTimes(7);
    });

    it('measures emitted CSS separately even when no precompressed files exist', async () => {
        const css = await sizes(['main.css']);

        await expect(checkBuildSizeBudgets(stats, { css: { raw: 0, gzip: 0 } })).rejects.toThrow(
            BuildSizeBudgetError,
        );

        const output = warn.mock.calls.flat().join('\n');

        expect(output).toContain(`client/main: initial CSS (raw) is ${css.raw} bytes`);
        expect(output).toContain(`client/main: initial CSS (gzip) is ${css.gzip} bytes`);
        expect(output).toContain('BUILD SIZE BUDGET EXCEEDED');
        expect(warn).toHaveBeenCalledTimes(3);
    });

    it('does not warn at or below the limit', async () => {
        const main = await sizes(['runtime.js', 'vendor.js', 'main.js']);
        const css = await sizes(['main.css']);

        await expect(checkBuildSizeBudgets(stats, { js: main, css })).resolves.toBeUndefined();

        expect(warn).not.toHaveBeenCalled();
    });

    it('reads shared assets once and measures only configured types', async () => {
        const read = jest.spyOn(fs, 'readFile');

        await expect(checkBuildSizeBudgets(stats, { js: { raw: 0 } })).rejects.toThrow(
            BuildSizeBudgetError,
        );

        expect(read).toHaveBeenCalledTimes(4);
        expect(read.mock.calls.some(([file]) => String(file).endsWith('.css'))).toBe(false);
    });

    it('fails the build on over-budget without adding compiler diagnostics even in CI', async () => {
        const previousCI = process.env.CI;

        process.env.CI = 'true';
        const warnings = stats.compilation.warnings.length;

        try {
            await expect(checkBuildSizeBudgets(stats, { js: { raw: 0 } })).rejects.toThrow(
                BuildSizeBudgetError,
            );
            expect(warn).toHaveBeenCalled();
            expect(stats.compilation.warnings).toHaveLength(warnings);
            expect(stats.hasErrors()).toBe(false);
        } finally {
            if (previousCI === undefined) delete process.env.CI;
            else process.env.CI = previousCI;
        }
    });

    it('fails the build when measurement fails instead of reporting zero', async () => {
        jest.spyOn(fs, 'readFile').mockRejectedValue(new Error('Permission denied'));

        await expect(checkBuildSizeBudgets(stats, { js: { raw: 1 } })).rejects.toThrow(
            BuildSizeBudgetError,
        );

        const output = warn.mock.calls.flat().join('\n');

        expect(output).toContain('Could not measure client/main JS: Permission denied');
        expect(output).not.toContain('exceeded by');
    });

    it('fails the build when the chunk graph cannot be walked', async () => {
        const brokenStats = {
            compilation: {
                name: 'client',
                outputOptions: { path: path.join(directory, 'dist') },
                entrypoints: new Map([
                    [
                        'main',
                        {
                            getFiles: () => {
                                throw new Error('broken chunk graph');
                            },
                            getParents: () => [],
                        },
                    ],
                ]),
            },
        } as unknown as Stats;

        await expect(checkBuildSizeBudgets(brokenStats, { js: { raw: 0 } })).rejects.toThrow(
            BuildSizeBudgetError,
        );

        expect(warn.mock.calls.flat().join('\n')).toContain(
            'Could not measure client/main JS: broken chunk graph',
        );
    });

    it('prefers the emitted .gz size over compressing in memory', async () => {
        const shared = await sizes(['runtime.js', 'vendor.js']);
        const inMemory = await sizes(['main.js']);
        const emittedSize = 4096;

        expect(inMemory.gzip).not.toBe(emittedSize);

        stats.compilation.emitAsset(
            'main.js.gz',
            new rspack.sources.RawSource(Buffer.alloc(emittedSize)),
        );

        try {
            await expect(checkBuildSizeBudgets(stats, { js: { gzip: 0 } })).rejects.toThrow(
                BuildSizeBudgetError,
            );
        } finally {
            stats.compilation.deleteAsset('main.js.gz');
        }

        const output = warn.mock.calls.flat().join('\n');

        expect(output).toContain(
            `client/main: initial JS (gzip) is ${emittedSize + shared.gzip} bytes`,
        );
    });

    it('uses the build name passed by the compiler command', async () => {
        await expect(
            checkBuildSizeBudgets(stats, { js: { raw: 0 } }, 'custom-build'),
        ).rejects.toThrow(BuildSizeBudgetError);

        const output = warn.mock.calls.flat().join('\n');

        expect(output).toContain('custom-build/main: initial JS (raw)');
        expect(output).not.toContain('client/main:');
    });
});
