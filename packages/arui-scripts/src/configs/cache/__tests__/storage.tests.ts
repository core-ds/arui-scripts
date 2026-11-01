import fs from 'fs';
import os from 'os';
import path from 'path';

import { type AppContextWithConfigs } from '../../app-configs/types';
import { cacheDirectory, cacheSettings } from '../settings';
import { acquireCache, clearCache, inspectCache } from '../storage';

let root: string;
const namespace = {
    name: 'client-main',
    mode: 'production',
    target: 'client',
    fingerprint: 'abc',
    dependencies: 5,
};
const config = (settings: unknown = true) =>
    ({
        cwd: root,
        buildPath: '.build',
        appNodeModules: path.join(root, 'node_modules'),
        persistentCache: settings,
    } as AppContextWithConfigs);

beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-cache-storage-'));
});
afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
});

it('holds ownership until release and clear refuses active writers', () => {
    const directory = cacheDirectory(config());
    const release = acquireCache(directory, namespace);

    expect(inspectCache(directory).namespaces).toEqual([namespace]);
    expect(() => clearCache(directory)).toThrow('active writer');
    expect(() => acquireCache(directory, namespace)).toThrow('active writer');
    release();
    clearCache(directory);
    expect(inspectCache(directory).namespaces).toEqual([]);
    expect(fs.existsSync(path.join(directory, '.arui-cache.json'))).toBe(true);
});

it('clear accepts missing caches but refuses unowned directories', () => {
    expect(() => clearCache(path.join(root, 'missing'))).not.toThrow();
    expect(() => clearCache(root)).toThrow();
    fs.writeFileSync(path.join(root, 'keep.txt'), 'keep');
    expect(() => acquireCache(root, namespace)).toThrow('ownership marker');
    expect(fs.readFileSync(path.join(root, 'keep.txt'), 'utf8')).toBe('keep');
});

it('clear preserves unrelated files even inside an owned root', () => {
    const directory = cacheDirectory(config());

    acquireCache(directory, namespace)();
    fs.writeFileSync(path.join(directory, 'keep.txt'), 'keep');
    fs.mkdirSync(path.join(directory, 'other-cache'));
    fs.writeFileSync(path.join(directory, 'other-cache/keep'), 'keep');
    clearCache(directory);
    expect(fs.readFileSync(path.join(directory, 'keep.txt'), 'utf8')).toBe('keep');
    expect(fs.readFileSync(path.join(directory, 'other-cache/keep'), 'utf8')).toBe('keep');
    expect(fs.existsSync(path.join(directory, namespace.name))).toBe(false);
});

it('clear never follows a symlink out of an owned cache', () => {
    const directory = cacheDirectory(config());

    acquireCache(directory, namespace)();
    fs.mkdirSync(path.join(root, 'outside'));
    fs.writeFileSync(path.join(root, 'outside/keep'), 'keep');
    fs.symlinkSync(path.join(root, 'outside'), path.join(directory, 'escape'));
    expect(() => clearCache(directory)).toThrow('symlink');
    expect(fs.readFileSync(path.join(root, 'outside/keep'), 'utf8')).toBe('keep');
});

it.each(['.', '..', '/', '.build', '.build/cache', 'node_modules'])(
    'rejects unsafe cache directory %s',
    (directory) => {
        expect(() => cacheDirectory(config({ directory }))).toThrow('unsafe');
    },
);

it('rejects a cache path that follows a symlink', () => {
    fs.mkdirSync(path.join(root, 'outside'));
    fs.symlinkSync(path.join(root, 'outside'), path.join(root, 'cache-link'));
    expect(() => cacheDirectory(config({ directory: 'cache-link/rspack' }))).toThrow('symlink');
});

it.each([
    { modes: [] },
    { modes: ['prod'] },
    { env: [2] },
    { readonly: 'yes' },
    { typo: true },
    { buildDependencies: ['missing'] },
])('rejects invalid settings %j', (settings) => {
    expect(() => cacheSettings(config(settings))).toThrow('persistentCache');
});
