import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { constants as zlibConstants, gzipSync } from 'zlib';

import { type Compiler, rspack, type Stats } from '@rspack/core';
import filesize from 'filesize';

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
            expect(output).toContain(
                `client/${name}: initial JS (raw) is ${filesize(expected.raw)}`,
            );
            expect(output).toContain(
                `client/${name}: initial JS (gzip) is ${filesize(expected.gzip)}`,
            );
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

        expect(output).toContain(`client/main: initial CSS (raw) is ${filesize(css.raw)}`);
        expect(output).toContain(`client/main: initial CSS (gzip) is ${filesize(css.gzip)}`);
        expect(output).toContain('BUILD SIZE BUDGET EXCEEDED');
        expect(warn).toHaveBeenCalledTimes(3);
    });

    describe.each(['raw', 'gzip'] as const)('%s size formatting', (metric) => {
        it.each<[number, number, string]>([
            [512, 256, '512 B; limit 256 B; exceeded by 256 B.'],
            [1024, 1023, '1 KB; limit 1023 B; exceeded by 1 B.'],
            [4096, 2048, '4 KB; limit 2 KB; exceeded by 2 KB.'],
            [1024 ** 2, 1024 ** 2 - 1, '1 MB; limit 1024 KB; exceeded by 1 B.'],
            [3 * 1024 ** 2, 1024 ** 2, '3 MB; limit 1 MB; exceeded by 2 MB.'],
        ])('formats %i bytes with a limit of %i bytes', async (actual, limit, expected) => {
            const content = Buffer.alloc(actual);

            jest.spyOn(fs, 'readFile').mockResolvedValue(content);

            const source = new rspack.sources.RawSource(content);

            stats.compilation.emitAsset('main.css.gz', source);

            const message = `[buildSizeBudgets] client/main: initial CSS (${metric}) is ${expected}`;

            try {
                await expect(
                    checkBuildSizeBudgets(stats, { css: { [metric]: limit } }),
                ).rejects.toThrow(message);
            } finally {
                stats.compilation.deleteAsset('main.css.gz');
            }

            expect(warn.mock.calls.flat().join('\n')).toContain(message);
        });
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

        const [entryName] = stats.compilation.entrypoints.keys();

        expect(output).toContain(`Could not measure client/${entryName} JS: Permission denied`);
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

    it.each([
        [1_234_204, '1.18 MB'],
        [1024 ** 3, '1024 MB'],
    ])(
        'prefers the emitted .gz size and caps units at MB (%i bytes)',
        async (emittedSize, expectedSize) => {
            const inMemory = await sizes(['main.js']);
            const limit = 1_000;

            expect(inMemory.gzip).not.toBe(emittedSize);

            const emittedSource = new rspack.sources.RawSource('emitted gzip');

            jest.spyOn(emittedSource, 'size').mockReturnValue(emittedSize);
            const getAsset = stats.compilation.getAsset.bind(stats.compilation);
            const mainAsset = getAsset('main.js')!;
            const asset = jest
                .spyOn(stats.compilation, 'getAsset')
                .mockImplementation((name) =>
                    name === 'main.js.gz'
                        ? { ...mainAsset, name, source: emittedSource }
                        : getAsset(name),
                );

            try {
                await expect(checkBuildSizeBudgets(stats, { js: { gzip: limit } })).rejects.toThrow(
                    BuildSizeBudgetError,
                );
            } finally {
                asset.mockRestore();
            }

            const output = warn.mock.calls.flat().join('\n');

            expect(output).toContain(
                `client/main: initial JS (gzip) is ${expectedSize}; limit 1000 B; exceeded by ${expectedSize}.`,
            );
        },
    );

    it('uses the build name passed by the compiler command', async () => {
        await expect(
            checkBuildSizeBudgets(stats, { js: { raw: 0 } }, 'custom-build'),
        ).rejects.toThrow(BuildSizeBudgetError);

        const output = warn.mock.calls.flat().join('\n');

        expect(output).toContain('custom-build/main: initial JS (raw)');
        expect(output).not.toContain('client/main:');
    });
});
