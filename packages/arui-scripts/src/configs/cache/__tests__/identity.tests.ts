import { type Configuration } from '@rspack/core';

import { configs } from '../../app-configs';
import { finalizePersistentCache, getRspackCache, stableSerialize } from '../../persistent-cache';

jest.mock('../../app-configs', () => ({
    appConfigs: { persistentCache: true },
    configs: {
        cwd: '/app',
        name: 'test',
        buildPath: '.build',
        appNodeModules: '/app/node_modules',
        appPackage: {},
        persistentCache: true,
    },
}));
jest.mock('../dependencies', () => ({
    cacheDependencies: () => [],
    linkedDependencyPaths: () => [],
}));

const configuration = (entry: string, name?: string): Configuration => ({
    name,
    entry,
    cache: getRspackCache('prod', 'client'),
    output: { path: '/app/.build' },
});

it('isolates unnamed outputs and colliding sanitized names', () => {
    const result = finalizePersistentCache([
        configuration('./a.ts'),
        configuration('./b.ts'),
        configuration('./a.ts', 'a/b'),
        configuration('./a.ts', 'a_b'),
    ]);
    const caches = result.map((item) => item.cache);

    expect(
        new Set(
            caches.map(
                (cache) => typeof cache === 'object' && cache.type === 'persistent' && cache.name,
            ),
        ).size,
    ).toBe(4);
});

it('keeps identity when a multiconfig is reordered', () => {
    const a = finalizePersistentCache([configuration('./a.ts'), configuration('./b.ts')]);
    const b = finalizePersistentCache([configuration('./b.ts'), configuration('./a.ts')]);

    expect(a[0].cache).toEqual(b[1].cache);
    expect(a[1].cache).toEqual(b[0].cache);
});

it('isolates processing profiles with the same name and entry', () => {
    const a = configuration('./a.ts');
    const b = configuration('./a.ts');

    a.devtool = 'source-map';
    b.devtool = false;
    finalizePersistentCache([a, b]);
    expect(a.cache).not.toEqual(b.cache);
});

it('preserves a low-level cache override', () => {
    const config = configuration('./a.ts');

    config.cache = false;
    finalizePersistentCache(config);
    expect(config.cache).toBe(false);
});

it('falls back for an opaque setting instead of sharing an unknown key', () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const config = configuration('./a.ts');

    config.resolve = { alias: { opaque: new Map() } } as unknown as Configuration['resolve'];
    finalizePersistentCache(config);
    expect(config.cache).toBe(false);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('opaque'));
    warning.mockRestore();
});

it('portable names stay stable but native reuse is guarded by checkout', () => {
    configs.persistentCache = { portable: true };
    const a = finalizePersistentCache(configuration('/app/src/a.ts'));

    configs.cwd = '/other';
    configs.appNodeModules = '/other/node_modules';
    const b = configuration('/other/src/a.ts');

    b.output = { path: '/other/.build' };
    finalizePersistentCache(b);
    expect(typeof a.cache === 'object' && a.cache.type === 'persistent' && a.cache.name).toEqual(
        typeof b.cache === 'object' && b.cache.type === 'persistent' && b.cache.name,
    );
    expect(
        typeof a.cache === 'object' && a.cache.type === 'persistent' && a.cache.version,
    ).not.toEqual(typeof b.cache === 'object' && b.cache.type === 'persistent' && b.cache.version);
});

it('stable serialization rejects cycles and bound functions', () => {
    const value: { self?: unknown } = {};

    value.self = value;
    expect(() => stableSerialize(value)).toThrow('circular');
    expect(() => stableSerialize(() => 1)).not.toThrow();
    expect(() => stableSerialize(Math.max)).toThrow('native');
});

it('keeps plain plugin tuples and their options in the fingerprint', () => {
    expect(stableSerialize({ plugins: [['plugin', { flag: true }]] })).not.toEqual(
        stableSerialize({ plugins: [['plugin', { flag: false }]] }),
    );
});
