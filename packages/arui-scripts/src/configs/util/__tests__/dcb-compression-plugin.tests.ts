import { type Compilation, type Compiler, sources } from '@rspack/core';

import { CustomCompressionPlugin } from '../dcb-compression-plugin';

describe('dictionary compression assets', () => {
    function setup({
        text = 'a'.repeat(100),
        compressed = false,
        matches = true,
        cached = {},
        sourceOnly = false,
    } = {}) {
        const input = Buffer.from(text);
        const source = sourceOnly ? { source: () => text } : new sources.RawSource(input);
        const asset = { source, info: { compressed } };
        const item = {
            getPromise: jest.fn().mockResolvedValue(cached),
            storePromise: jest.fn().mockResolvedValue(undefined),
        };
        const cache = {
            getItemCache: jest.fn(() => item),
            getLazyHashedEtag: jest.fn(() => 'etag'),
        };
        const compilation = {
            getCache: jest.fn(() => cache),
            getAsset: jest.fn(() => asset),
            getPath: (name: string) => name,
            emitAsset: jest.fn(),
            updateAsset: jest.fn(),
            errors: [] as Error[],
        };
        const compiler = {
            webpack: { sources, ModuleFilenameHelpers: { matchObject: () => matches } },
        };
        const algorithm = jest.fn().mockResolvedValue(Buffer.from('small'));
        const plugin = new CustomCompressionPlugin({
            algorithm,
            filename: ({ filename }) => `${filename}.dcb`,
            threshold: 10,
            minRatio: 0.8,
        });
        const run = () =>
            plugin.compress(
                compiler as unknown as Compiler,
                compilation as unknown as Compilation,
                { 'main.js': new sources.RawSource(input) },
            );

        return { plugin, algorithm, run, compilation, item, source, input };
    }
    test.each([false, true])(
        'compresses buffer/string assets and links the output (string=%s)',
        async (sourceOnly) => {
            const { run, algorithm, compilation, input, item } = setup({ sourceOnly });

            await run();
            expect(algorithm).toHaveBeenCalledWith(input, { filename: 'main.js' });
            expect(compilation.emitAsset).toHaveBeenCalledWith(
                'main.js.dcb',
                expect.any(sources.RawSource),
                { compressed: true },
            );
            expect(compilation.emitAsset.mock.calls[0][1].source().toString()).toBe('small');
            expect(Object.values(compilation.updateAsset.mock.calls[0][2].related)).toEqual([
                'main.js.dcb',
            ]);
            expect(item.storePromise).toHaveBeenCalled();
        },
    );
    test.each([{ compressed: true }, { matches: false }, { text: 'small' }])(
        'skips ineligible assets: %j',
        async (options) => {
            const { run, algorithm, compilation } = setup(options);

            await run();
            expect(algorithm).not.toHaveBeenCalled();
            expect(compilation.emitAsset).not.toHaveBeenCalled();
        },
    );
    test('skips an asset removed by an earlier plugin', async () => {
        const { run, compilation, algorithm } = setup();

        compilation.getAsset.mockReturnValue(undefined as never);
        await run();
        expect(algorithm).not.toHaveBeenCalled();
    });
    test('records algorithm failures as compilation errors', async () => {
        const { run, algorithm, compilation } = setup();
        const error = new Error('compression failed');

        algorithm.mockRejectedValue(error);
        await run();
        expect(compilation.errors).toEqual([error]);
        expect(compilation.emitAsset).not.toHaveBeenCalled();
    });
    test('does not emit compression that exceeds the ratio limit', async () => {
        const { run, algorithm, item, compilation } = setup();
        const compressed = Buffer.alloc(90);

        algorithm.mockResolvedValue(compressed);
        await run();
        expect(item.storePromise).toHaveBeenCalledWith({ compressed });
        expect(compilation.emitAsset).not.toHaveBeenCalled();
    });
    test('reuses cached compressed bytes when evaluating ratio', async () => {
        const { run, algorithm, compilation } = setup({
            cached: { compressed: Buffer.from('small') },
        });

        await run();
        expect(algorithm).not.toHaveBeenCalled();
        expect(compilation.emitAsset).toHaveBeenCalledTimes(1);
    });
    test('hooks compression into the optimize-transfer stage', async () => {
        const { plugin } = setup();
        const compress = jest.spyOn(plugin, 'compress').mockResolvedValue(undefined);
        const tap = jest.fn();
        const compiler = {
            hooks: { thisCompilation: { tap } },
            webpack: { Compilation: { PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER: 3000 } },
        };

        plugin.apply(compiler as unknown as Compiler);
        const tapPromise = jest.fn();
        const compilation = { hooks: { processAssets: { tapPromise } } };

        tap.mock.calls[0][1](compilation);
        expect(tapPromise.mock.calls[0][0]).toMatchObject({ stage: 3000 });
        await tapPromise.mock.calls[0][1]({});
        expect(compress).toHaveBeenCalledWith(compiler, compilation, {});
    });
});
