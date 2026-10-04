import { type Compilation, type Compiler, ModuleFilenameHelpers, sources } from '@rspack/core';

import { CustomCompressionPlugin } from '../dcb-compression-plugin';

function harness() {
    const entries = new Map<string, Buffer>();
    const compiler = { webpack: { sources, ModuleFilenameHelpers } } as unknown as Compiler;

    return async (plugins: CustomCompressionPlugin[]) => {
        const source = new sources.RawSource('x'.repeat(1000));
        const asset = { source, info: {} };
        const emitted: Record<string, Buffer> = {};
        const compilation = {
            getCache: () => ({
                getLazyHashedEtag: () => 'unchanged-input',
                getItemCache: (key: string) => ({
                    getPromise: async () => entries.get(key),
                    storePromise: async (value: Buffer) => {
                        entries.set(key, value);
                    },
                }),
            }),
            getAsset: () => asset,
            getPath: (value: string) => value,
            updateAsset: (_name: string, _source: unknown, info: object) => {
                Object.assign(asset.info, info);
            },
            emitAsset: (name: string, output: sources.RawSource) => {
                emitted[name] = output.buffer();
            },
            errors: [],
        } as unknown as Compilation;

        // Plugins share one compilation and run sequentially, as in Rspack.
        for (const plugin of plugins) {
            // eslint-disable-next-line no-await-in-loop
            await plugin.compress(compiler, compilation, { 'main.js': source });
        }

        return emitted;
    };
}

it('emits identical output on cache hits without recompressing', async () => {
    const compile = harness();
    const algorithm = jest.fn(async () => Buffer.from('compressed'));
    const plugin = new CustomCompressionPlugin({
        test: /\.js$/,
        filename: ({ filename }) => `${filename}.dcb`,
        cacheKey: () => 'dictionary-a',
        algorithm,
        threshold: 10,
        minRatio: 0.8,
    });
    const cold = await compile([plugin]);
    const warm = await compile([plugin]);

    expect(cold['main.js.dcb']).toEqual(Buffer.from('compressed'));
    expect(warm).toEqual(cold);
    expect(algorithm).toHaveBeenCalledTimes(1);
});

it('invalidates the cache when dictionary contents change', async () => {
    const compile = harness();
    let dictionary = 'first';
    const algorithm = jest.fn(async () => Buffer.from(dictionary));
    const plugin = new CustomCompressionPlugin({
        test: /\.js$/,
        filename: ({ filename }) => `${filename}.dcb`,
        cacheKey: () => dictionary,
        algorithm,
        threshold: 10,
        minRatio: 0.8,
    });

    await compile([plugin]);
    dictionary = 'second';
    expect((await compile([plugin]))['main.js.dcb']).toEqual(Buffer.from('second'));
    expect(algorithm).toHaveBeenCalledTimes(2);
});

it('emits independent outputs for algorithms closing over different dictionaries', async () => {
    const compile = harness();
    const plugins = ['a', 'b'].map(
        (dictionary) =>
            new CustomCompressionPlugin({
                test: /\.js$/,
                filename: ({ filename }) => `${filename}.${dictionary}.dcb`,
                cacheKey: () => dictionary,
                algorithm: async () => Buffer.from(dictionary),
                threshold: 10,
                minRatio: 0.8,
            }),
    );
    const cold = await compile(plugins);

    expect(cold).toEqual({ 'main.js.a.dcb': Buffer.from('a'), 'main.js.b.dcb': Buffer.from('b') });
    expect(await compile(plugins)).toEqual(cold);
});
