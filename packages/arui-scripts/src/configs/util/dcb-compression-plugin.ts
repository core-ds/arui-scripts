import crypto, { type Hash } from 'crypto';

import {
    type Assets,
    type Compilation,
    type Compiler,
    type PathData,
    type RspackError,
} from '@rspack/core';
import { type Rules } from 'compression-webpack-plugin';
import serialize from 'serialize-javascript';

import { getCompressionCache } from '../../plugins/compression-cache';

type DcbCompressionOptions = {
    test?: Rules;
    include?: Rules;
    exclude?: Rules;
    /** Capture the dictionary bytes once so the key and compressor use the same input. */
    prepare: (filename: string) => { key: string; compress: (input: Buffer) => Promise<Buffer> };
    fileDependencies?: string[];
    filename: (pathdata: PathData) => string;
    threshold: number;
    minRatio: number;
};

type HashableObject = {
    updateHash(hash: Hash): void;
};

/*
Based on compression-webpack-plugin, https://github.com/webpack-contrib/compression-webpack-plugin/tree/master
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

export class CustomCompressionPlugin {
    constructor(protected options: DcbCompressionOptions) {}

    async compress(compiler: Compiler, compilation: Compilation, assets: Assets) {
        const cache = compilation.getCache('arui-scripts/dcb-v2');
        const { RawSource } = compiler.webpack.sources;

        await Promise.all(
            Object.keys(assets).map(async (name) => {
                const asset = compilation.getAsset(name);

                if (
                    !asset ||
                    asset.info.compressed ||
                    !compiler.webpack.ModuleFilenameHelpers.matchObject(this.options, name)
                ) {
                    return;
                }
                const newFilename = compilation.getPath(this.options.filename({ filename: name }));

                if (!newFilename) return;
                // Different dictionaries must not suppress one another's output.
                const relatedName = `dcb-${crypto
                    .createHash('sha256')
                    .update(newFilename)
                    .digest('hex')}`;

                if (Object.prototype.hasOwnProperty.call(asset.info.related || {}, relatedName))
                    return;

                const source = asset.source.buffer();

                if (source.length < this.options.threshold) return;
                const task = this.options.prepare(name);
                const identity = serialize({
                    algorithm: 'dcb',
                    dictionary: task.key,
                    implementation: task.compress,
                });
                const cacheItem = cache.getItemCache(
                    serialize({ name, identity }),
                    cache.getLazyHashedEtag(asset.source as HashableObject),
                );
                let compressed: Buffer | undefined = await cacheItem.getPromise();

                if (!compressed) {
                    try {
                        const disk = getCompressionCache(compiler);

                        compressed = disk
                            ? await disk.get(source, identity, () => task.compress(source))
                            : await task.compress(source);
                    } catch (error) {
                        compilation.errors.push(error as RspackError);

                        return;
                    }
                    // Store only bytes: restore a fresh Source on every compilation.
                    await cacheItem.storePromise(compressed);
                }
                if (compressed.length / source.length > this.options.minRatio) return;
                compilation.updateAsset(name, asset.source, {
                    related: { ...asset.info.related, [relatedName]: newFilename },
                });
                compilation.emitAsset(newFilename, new RawSource(compressed), { compressed: true });
            }),
        );
    }

    apply(compiler: Compiler) {
        const pluginName = this.constructor.name;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            this.options.fileDependencies?.forEach((file) =>
                compilation.fileDependencies.add(file),
            );
            compilation.hooks.processAssets.tapPromise(
                {
                    name: pluginName,
                    stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
                    // additionalAssets: true,
                },
                (assets) => this.compress(compiler, compilation, assets),
            );
        });
    }
}
