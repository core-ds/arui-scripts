import { brotliCompress, gzip } from 'zlib';

import { type Compiler } from '@rspack/core';
import type CompressionPlugin from 'compression-webpack-plugin';
import serialize from 'serialize-javascript';

import { getCompressionCache } from '../../plugins/compression-cache';

type CompressionRuntime = {
    algorithm: unknown;
    options: { compressionOptions: unknown };
    runCompressionAlgorithm: (input: Buffer) => Promise<Buffer>;
};

/** Preserve the plugin instance/name/options consumed by existing overrides. */
export function withPersistentCompression<T>(plugin: CompressionPlugin<T>): CompressionPlugin<T> {
    const { apply } = plugin;

    // compression-webpack-plugin 9 keeps the resolved function separate from public options.
    // Give each compiler a receiver so sharing one plugin instance cannot mix cache ownership.
    // eslint-disable-next-line no-param-reassign
    plugin.apply = (compiler) => {
        const instance = Object.create(plugin) as CompressionRuntime;
        const run = instance.runCompressionAlgorithm.bind(instance);

        instance.runCompressionAlgorithm = (input) => {
            const cache = getCompressionCache(compiler as unknown as Compiler);
            let algorithm: string | undefined;

            if (instance.algorithm === gzip) algorithm = 'gzip';
            else if (instance.algorithm === brotliCompress) algorithm = 'brotliCompress';

            // Custom callback algorithms may capture state not represented by their source.
            if (!cache || !algorithm) return run(input);

            let identity: string;

            try {
                identity = serialize({ algorithm, options: instance.options.compressionOptions });
            } catch {
                return run(input);
            }

            return cache.get(input, identity, () => run(input));
        };
        apply.call(instance, compiler);
    };

    return plugin;
}
