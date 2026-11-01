/* eslint-disable no-param-reassign -- Final configuration and cache fallback are deliberately applied in place. */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { type CacheOptions, type Configuration } from '@rspack/core';

import { cacheDependencies, linkedDependencyPaths } from './cache/dependencies';
import { cacheDirectory, cacheSettings } from './cache/settings';
import { acquireCache, type CacheNamespace } from './cache/storage';
import { appConfigs, configs } from './app-configs';

const requested = new WeakMap<object, { mode: 'dev' | 'production'; target: string }>();
const managed = new WeakMap<Configuration, { directory: string; info: CacheNamespace }>();

/** Explicit unsupported values cause a fallback; distinct settings never share an "unknown" key. */
export function stableSerialize(
    value: unknown,
    normalize: (text: string) => string = (text) => text,
): string {
    const active = new Set<object>();
    const visit = (item: unknown): unknown => {
        if (typeof item === 'string') return normalize(item);
        if (item === undefined) return { $undefined: true };
        if (typeof item === 'function') {
            const source = Function.prototype.toString.call(item);

            if (source.includes('[native code]'))
                throw new Error('a bound/native function cannot be fingerprinted');

            return { $function: normalize(source) };
        }
        if (item === null || typeof item === 'boolean' || typeof item === 'number') return item;
        if (item instanceof RegExp) return { $regexp: item.source, flags: item.flags };
        if (typeof item !== 'object')
            throw new Error(`unsupported fingerprint value: ${typeof item}`);
        if (active.has(item)) throw new Error('a circular setting cannot be fingerprinted');
        if (
            !Array.isArray(item) &&
            Object.getPrototypeOf(item) !== Object.prototype &&
            Object.getPrototypeOf(item) !== null
        )
            throw new Error('an opaque setting cannot be fingerprinted');
        active.add(item);
        const result = Array.isArray(item)
            ? item.map(visit)
            : Object.fromEntries(
                  Object.keys(item)
                      .sort()
                      .map((key) => [
                          key,
                          ['plugins', 'minimizer'].includes(key) &&
                          Array.isArray((item as Record<string, unknown>)[key])
                              ? (item as Record<string, unknown[]>)[key]
                                    .filter(Boolean)
                                    .map((plugin) => {
                                        if (
                                            typeof plugin === 'object' &&
                                            plugin !== null &&
                                            !Array.isArray(plugin) &&
                                            Object.getPrototypeOf(plugin) !== Object.prototype &&
                                            Object.getPrototypeOf(plugin) !== null
                                        )
                                            return { $pluginType: plugin.constructor.name };

                                        return visit(plugin);
                                    })
                              : visit((item as Record<string, unknown>)[key]),
                      ]),
              );

        active.delete(item);

        return result;
    };

    return JSON.stringify(visit(value));
}

function hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

export function getRspackCache(mode: 'dev' | 'prod', target: string): CacheOptions {
    const settings = cacheSettings(configs);
    const cacheMode = mode === 'dev' ? 'dev' : 'production';

    if (!settings || !(settings.modes || ['dev', 'production']).includes(cacheMode))
        return mode === 'dev';
    const option: CacheOptions = { type: 'persistent' };

    requested.set(option, { mode: cacheMode, target });

    return option;
}

/** Called after overrides so raw cache overrides retain precedence and final outputs determine identity. */
export function finalizePersistentCache<T extends Configuration | Configuration[]>(
    configuration: T,
): T {
    const configurations = Array.isArray(configuration) ? configuration : [configuration];

    configurations.forEach((config) => {
        const request =
            config.cache && typeof config.cache === 'object'
                ? requested.get(config.cache)
                : undefined;

        if (!request) return;
        const fallback = request.mode === 'dev';

        try {
            const settings = cacheSettings(configs) || {};
            const directory = cacheDirectory(configs);
            const normalize = settings.portable
                ? (text: string) =>
                      text
                          .split(configs.cwd)
                          .join('<project>')
                          .split(path.resolve(__dirname, '../..'))
                          .join('<arui>')
                : (text: string) => text;
            const identity = stableSerialize(
                {
                    project: configs.name,
                    target: request.target,
                    name: config.name,
                    mode: request.mode,
                    entry: config.entry,
                    output: config.output,
                    targetPlatform: config.target,
                    profile: {
                        module: config.module,
                        resolve: config.resolve,
                        optimization: config.optimization,
                        devtool: config.devtool,
                        externals: config.externals,
                    },
                },
                normalize,
            );
            const name = `${`${request.target}-${config.name || 'main'}-${request.mode}`
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .slice(0, 80)}-${hash(identity).slice(0, 20)}`;
            const dependencies = cacheDependencies(configs);
            const { plugins, cache, devServer, ...semanticConfig } = config;
            const { persistentCache, ...semanticSettings } = appConfigs;
            const env = Object.fromEntries(
                [
                    ...new Set([
                        'NODE_ENV',
                        'BABEL_ENV',
                        'BROWSERSLIST',
                        'BROWSERSLIST_ENV',
                        'BROWSERSLIST_CONFIG',
                        'USE_ISTANBUL',
                        ...(settings.env || []),
                    ]),
                ]
                    .sort()
                    .map((key) => [key, process.env[key]]),
            );
            // Plugin objects are deliberately not serialized. Their definitions/imports are build dependencies;
            // authors must declare dynamic env/files used by custom plugins with env/buildDependencies/version.
            const version = hash(
                stableSerialize(
                    {
                        schema: 1,
                        toolchain: {
                            node: process.versions.node,
                            platform: process.platform,
                            arch: process.arch,
                        },
                        settings: semanticSettings,
                        config: semanticConfig,
                        pluginTypes: plugins
                            ?.filter(Boolean)
                            .map((plugin: unknown) =>
                                typeof plugin === 'function'
                                    ? plugin.name
                                    : (plugin as object)?.constructor.name,
                            ),
                        env,
                        dependencies: dependencies.map(normalize),
                        portable: !!settings.portable,
                        userVersion: settings.version,
                    },
                    normalize,
                ),
            );
            const location = path.join(directory, name);
            // Rspack 2.2.5 restores old readable module paths/source maps after relocation.
            // Keep the semantic fingerprint portable, but partition native reuse by checkout
            // until upstream relocation passes byte-for-byte artifact/source-map parity.
            const checkout = hash(config.context || configs.cwd);
            const backendVersion = settings.portable ? `${version}-checkout-${checkout}` : version;
            const metadata = path.join(location, '.namespace.json');

            if (settings.portable && fs.existsSync(metadata)) {
                const previous = JSON.parse(fs.readFileSync(metadata, 'utf8'));

                if (previous.checkout && previous.checkout !== checkout)
                    console.warn(
                        '[arui-scripts cache] Checkout path changed. Rebuilding to avoid stale paths/source maps in Rspack 2.2.5; subsequent builds in this checkout can reuse the cache.',
                    );
            }

            config.cache = {
                type: 'persistent',
                name,
                version: backendVersion,
                buildDependencies: dependencies,
                portable: settings.portable || false,
                readonly: settings.readonly || false,
                snapshot: { unmanagedPaths: linkedDependencyPaths(configs) },
                storage: { type: 'filesystem', location },
            };
            managed.set(config, {
                directory,
                info: {
                    name,
                    mode: request.mode,
                    target: request.target,
                    fingerprint: version,
                    dependencies: dependencies.length,
                    checkout,
                },
            });
        } catch (error) {
            console.warn(
                `[arui-scripts cache] Persistent cache disabled for ${request.target}: ${
                    (error as Error).message
                }`,
            );
            config.cache = fallback;
        }
    });

    return configuration;
}

export function acquireCompilerCaches(
    configuration: Configuration | Configuration[],
): Array<() => void> {
    const releases: Array<() => void> = [];

    (Array.isArray(configuration) ? configuration : [configuration]).forEach((config) => {
        const cache = managed.get(config);

        if (
            !cache ||
            typeof config.cache !== 'object' ||
            config.cache.type !== 'persistent' ||
            config.cache.readonly
        )
            return;
        try {
            releases.push(acquireCache(cache.directory, cache.info));
        } catch (error) {
            console.warn(
                `[arui-scripts cache] ${cache.info.name}: ${
                    (error as Error).message
                }. Continuing without persistent cache.`,
            );
            config.cache = cache.info.mode === 'dev';
        }
    });

    return releases;
}

export function describeCompilerCaches(configuration: Configuration | Configuration[]) {
    return (Array.isArray(configuration) ? configuration : [configuration]).map((config) => {
        const cache = managed.get(config);
        const mode = config.mode === 'development' ? 'dev' : 'production';
        const expected = cacheSettings(configs)?.modes || ['dev', 'production'];

        let policy = 'legacy';

        if (cache) policy = 'arui';
        else if (cacheSettings(configs) && expected.includes(mode)) policy = 'custom';

        return {
            name: config.name || 'main',
            mode,
            policy,
            namespace: cache?.info.name,
            fingerprint: cache?.info.fingerprint,
        };
    });
}
