import { types } from 'util';

import { Compiler, OptimizationSplitChunksCacheGroup, RspackPluginInstance } from '@rspack/core';

/**
 * Force remote entry not be affected by user's chunkSplit strategy,
 * Otherwise, the remote chunk will not be loaded correctly.
 * @see https://github.com/web-infra-dev/rsbuild/discussions/1461#discussioncomment-8329790
 */
export class TurnOffSplitRemoteEntry implements RspackPluginInstance {
    name: string;

    constructor(wmfContainerName: string) {
        this.name = wmfContainerName;
    }

    apply(compiler: Compiler): void {
        const { splitChunks } = compiler.options.optimization;

        if (!splitChunks) {
            return;
        }

        /* eslint-disable no-param-reassign */
        const applyPatch = (cacheGroup: OptimizationSplitChunksCacheGroup | false) => {
            if (typeof cacheGroup !== 'object' || types.isRegExp(cacheGroup)) {
                return;
            }

            // cacheGroup.chunks will inherit splitChunks.chunks
            // so we only need to modify the chunks that are set separately.
            const { chunks } = cacheGroup;

            if (!chunks || chunks === 'async') {
                return;
            }

            if (typeof chunks === 'function') {
                const prevChunks = chunks;

                cacheGroup.chunks = (chunk) => {
                    if (chunk.name && chunk.name === this.name) {
                        return false;
                    }

                    return prevChunks(chunk);
                };

                return;
            }

            if (chunks === 'all') {
                cacheGroup.chunks = (chunk) => {
                    if (chunk.name && chunk.name === this.name) {
                        return false;
                    }

                    return true;
                };

                return;
            }

            if (chunks === 'initial') {
                cacheGroup.chunks = (chunk) => {
                    if (chunk.name && chunk.name === this.name) {
                        return false;
                    }

                    return chunk.isOnlyInitial();
                };
            }
        };
        /* eslint-enable no-param-reassign */

        // patch splitChunk.chunks
        applyPatch(splitChunks);

        const { cacheGroups } = splitChunks;

        if (!cacheGroups) {
            return;
        }

        // patch splitChunk.cacheGroups[key].chunks
        for (const cacheGroupKey of Object.keys(cacheGroups)) {
            applyPatch(cacheGroups[cacheGroupKey]);
        }
    }
}
