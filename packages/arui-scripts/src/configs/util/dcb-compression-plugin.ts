import crypto from 'crypto';

import { Assets,Compilation, Compiler } from '@rspack/core';
import { PathData } from '@rspack/core/dist/Compilation';
import { RspackError } from '@rspack/core/dist/RspackError';
import { Rules } from 'compression-webpack-plugin';
import serialize from 'serialize-javascript';

type DcbCompressionOptions = {
    test?: Rules;
    include?: Rules;
    exclude?: Rules;
    algorithm: (input: Buffer, options: { filename: string }) => Promise<Buffer>;
    filename: (pathdata: PathData) => string;
    threshold: number;
    minRatio: number;
};

/*
Based on compression-webpack-plugin, https://github.com/webpack-contrib/compression-webpack-plugin/tree/master
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

export class CustomCompressionPlugin {
    constructor(
        protected options: DcbCompressionOptions
    ) {
    }

    runCompressionAlgorithm(input: Buffer, filename: string) {
        return this.options.algorithm(input, { filename });
    }

    async compress(compiler: Compiler, compilation: Compilation, assets: Assets) {
        const cache = compilation.getCache('BrCompressionWebpackPlugin');

        const assetsForCompression = (
            await Promise.all(
                Object.keys(assets).map(async (name) => {
                    const asset = compilation.getAsset(name);

                    if (!asset || asset.info.compressed) {
                        return false;
                    }

                    if (
                        !compiler.webpack.ModuleFilenameHelpers.matchObject.bind(
                            undefined,
                            this.options,
                        )(name)
                    ) {
                        return false;
                    }

                    const relatedName = `compression-function-${crypto
                        .createHash('md5')
                        .update(serialize(this.options.filename))
                        .digest('hex')}`;

                    if (asset.info.related && (asset.info.related as Record<string, boolean>)[relatedName]) {
                        return false;
                    }

                    const cacheItem = cache.getItemCache(
                        serialize({
                            name,
                            algorithm: this.options.algorithm,
                        }),
                        cache.getLazyHashedEtag(asset.source),
                    );
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const output = ((await cacheItem.getPromise()) || {}) as any;

                    let buffer;

                    // No need original buffer for cached files
                    if (!output.source) {
                        if (typeof asset.source.buffer === 'function') {
                            buffer = asset.source.buffer();
                        }
                            // Compatibility with webpack plugins which don't use `webpack-sources`
                        // See https://github.com/webpack-contrib/compression-webpack-plugin/issues/236
                        else {
                            buffer = asset.source.source();

                            if (!Buffer.isBuffer(buffer)) {
                                buffer = Buffer.from(buffer);
                            }
                        }

                        if (buffer.length < this.options.threshold) {
                            return false;
                        }
                    }

                    return { name, source: asset.source, info: asset.info, buffer, output, cacheItem, relatedName };
                }),
            )
        ).filter(Boolean);

        const { RawSource } = compiler.webpack.sources;
        const scheduledTasks = [];

        for (const asset of assetsForCompression) {
            scheduledTasks.push(
                (async () => {
                    if (!asset || !asset.buffer) {
                        return;
                    }
                    const { name, source, buffer, output, cacheItem, relatedName } = asset;

                    if (!output.source) {
                        if (!output.compressed) {
                            try {
                                output.compressed = await this.runCompressionAlgorithm(buffer, name);
                            } catch (error) {
                                compilation.errors.push(error as RspackError);

                                return;
                            }
                        }

                        if (
                            output.compressed.length / buffer.length >
                            this.options.minRatio
                        ) {
                            await cacheItem.storePromise({ compressed: output.compressed });

                            return;
                        }

                        output.source = new RawSource(output.compressed);

                        await cacheItem.storePromise(output);
                    }

                    const newFilename = compilation.getPath(this.options.filename, {
                        filename: name,
                    });

                    const newInfo = { compressed: true };

                    compilation.updateAsset(name, source, {
                        related: { [relatedName]: newFilename },
                    });

                    compilation.emitAsset(newFilename, output.source, newInfo);
                })(),
            );
        }

        await Promise.all(scheduledTasks);
    }

    apply(compiler: Compiler) {
        const pluginName = this.constructor.name;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: pluginName,
                    stage:
                    compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
                    // additionalAssets: true,
                },
                (assets) => this.compress(compiler, compilation, assets),
            );
        });
    }
}
