import path from 'path';

import { type Compiler } from '@rspack/core';

import { CompressionCache } from '../configs/cache/compression';

const caches = new WeakMap<Compiler, CompressionCache>();
// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const { version } = require('../../package.json') as { version: string };

export function getCompressionCache(compiler: Compiler) {
    return caches.get(compiler);
}

export class CompressionCachePlugin {
    constructor(private options: { location: string; readonly: boolean; version?: string }) {}

    apply(compiler: Compiler) {
        if (
            typeof compiler.options.cache !== 'object' ||
            compiler.options.cache.type !== 'persistent'
        )
            return;

        const logger = compiler.getInfrastructureLogger('arui-scripts.compressionCache');
        const cache = new CompressionCache({
            directory: path.join(this.options.location, 'compression-v1'),
            readonly: this.options.readonly,
            version: JSON.stringify([
                version,
                process.versions,
                process.platform,
                process.arch,
                this.options.version,
            ]),
            warn: (error) =>
                logger.warn('Compression cache unavailable; recomputing compressed bytes.', error),
        });

        caches.set(compiler, cache);
        compiler.hooks.thisCompilation.tap('CompressionCachePlugin', (compilation) => {
            cache.resetStats();
            compilation.hooks.processAssets.tap(
                {
                    name: 'CompressionCachePlugin',
                    stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
                },
                () =>
                    compilation
                        .getLogger('arui-scripts.compressionCache')
                        .info(`Compression cache: ${JSON.stringify(cache.stats)}`),
            );
        });
    }
}
