import crypto from 'crypto';

import { type Compiler, type Configuration, type MultiCompiler, rspackVersion } from '@rspack/core';

import { describeCompilerCaches } from '../../configs/persistent-cache';
import { getCompressionCache } from '../../plugins/compression-cache';

// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const { version } = require('../../../package.json') as { version: string };

const PREFIX = '[arui-scripts cache] ';

/** Only explicit snapshot evidence counts as disk reuse; generic recovery also occurs cold. */
export function summarizeNativeCache(messages: string[]) {
    let snapshot = 'unknown';
    let reason = 'no-native-evidence';

    if (
        messages.some((message) =>
            message.includes('snapshot restored with detected changed dependencies'),
        )
    ) {
        snapshot = 'invalidated';
        reason = 'dependencies-changed';
    } else if (
        messages.some((message) =>
            message.includes('snapshot restored with no changed dependencies'),
        )
    ) {
        snapshot = 'hit';
        reason = 'snapshot-unchanged';
    } else if (
        messages.some((message) => /version.*(does not match|doesn't match)/i.test(message))
    ) {
        snapshot = 'invalidated';
        reason = 'version-changed';
    } else if (messages.some((message) => /build dependencies.*(invalid|changed)/i.test(message))) {
        snapshot = 'invalidated';
        reason = 'build-dependencies-changed';
    } else if (
        messages.some((message) => message.includes('read snapshot from persistent cache'))
    ) {
        snapshot = 'cold';
        reason = 'no-restored-snapshot';
    }
    const errors = messages.filter((message) =>
        /(?:decode|recovery|save|reset) failed/i.test(message),
    ).length;

    if (errors && snapshot !== 'hit' && snapshot !== 'invalidated') {
        snapshot = 'unavailable';
        reason = 'native-cache-error';
    }
    const tracked = messages.join('\n').match(/build dependencies are valid \((\d+) tracked\)/);

    return {
        snapshot,
        reason,
        errors,
        trackedBuildDependencies: tracked ? Number(tracked[1]) : undefined,
    };
}

/** Debug output contains fixed labels, hashes and counters, never raw native logs or env values. */
export function attachCacheDiagnostics(
    compiler: Compiler | MultiCompiler,
    configuration: Configuration | Configuration[],
) {
    if (!['1', 'true'].includes(process.env.ARUI_SCRIPTS_CACHE_DEBUG?.toLowerCase() || ''))
        return undefined;

    const children = 'compilers' in compiler ? compiler.compilers : [compiler];
    const descriptions = describeCompilerCaches(configuration);
    const reporters = children.map((child, index) => {
        const description = descriptions[index];
        const { cache } = child.options;
        const persistent =
            typeof cache === 'object' && cache.type === 'persistent' ? cache : undefined;
        const common = {
            schemaVersion: 1,
            pid: process.pid,
            compiler: description.name,
            target: description.target,
            mode: description.mode,
            namespace: description.namespace,
        };
        const write = (event: string, details: object) => {
            console.error(`${PREFIX}${JSON.stringify({ ...common, event, ...details })}`);
        };
        let run = 0;
        let closed = false;
        let cacheType = cache ? 'memory' : 'disabled';
        let persistence = 'disabled';

        if (persistent) {
            cacheType = 'persistent';
            persistence = persistent.readonly ? 'readonly' : 'read-write';
        }

        write('configured', {
            policy: description.policy,
            reason: description.reason,
            cacheType,
            location:
                persistent?.storage?.type === 'filesystem'
                    ? persistent.storage.location
                    : undefined,
            fingerprint: description.fingerprint,
            versionHash: persistent
                ? crypto
                      .createHash('sha256')
                      .update(persistent.version || '')
                      .digest('hex')
                : undefined,
            readonly: persistent?.readonly || false,
            portable: persistent?.portable || false,
            compression: !!getCompressionCache(child),
            toolchain: {
                arui: version,
                rspack: rspackVersion,
                node: process.versions.node,
                platform: process.platform,
                arch: process.arch,
            },
        });
        child.hooks.done.tap('AruiCacheDiagnostics', (stats) => {
            run += 1;
            try {
                const snapshot =
                    persistent && run === 1
                        ? stats.toJson({
                              all: false,
                              logging: 'verbose',
                              loggingDebug: /^rspack\.persistentCache$/,
                          })
                        : undefined;
                const messages =
                    snapshot?.logging?.['rspack.persistentCache']?.entries?.map(
                        (entry) => entry.message || '',
                    ) || [];
                const compression = getCompressionCache(child);
                let native: object = { snapshot: 'disabled' };

                if (persistent) {
                    native =
                        run === 1 ? summarizeNativeCache(messages) : { snapshot: 'in-process' };
                }

                write('compilation', {
                    run,
                    result: stats.hasErrors() ? 'errors' : 'success',
                    durationMs:
                        stats.endTime !== undefined && stats.startTime !== undefined
                            ? stats.endTime - stats.startTime
                            : undefined,
                    native,
                    compression: compression
                        ? { enabled: true, ...compression.stats }
                        : { enabled: false },
                });
            } catch {
                write('diagnostic-error', { run, reason: 'stats-unavailable' });
            }
        });
        child.hooks.failed.tap('AruiCacheDiagnostics', () =>
            write('compilation', { run: run + 1, result: 'failed' }),
        );

        return (error: unknown, durationMs: number) => {
            if (closed) return;
            write('close', {
                result: error ? 'failed' : 'completed',
                durationMs,
                persistence,
            });
            closed = !error;
        };
    });

    return (error: unknown, durationMs: number) =>
        reporters.forEach((report) => report(error, durationMs));
}
