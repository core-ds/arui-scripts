import fs from 'fs';
import os from 'os';
import path from 'path';

import { type AppContextWithConfigs, type PersistentCacheSettings } from '../app-configs/types';

export const DEFAULT_CACHE_DIRECTORY = '.cache/arui-scripts/rspack';

export function containsPath(parent: string, child: string): boolean {
    const relative = path.relative(parent, child);

    return (
        relative === '' ||
        (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
    );
}

export function cacheSettings(config: AppContextWithConfigs): PersistentCacheSettings | null {
    const setting = config.persistentCache;

    if (setting === false) return null;
    if (setting === true) return {};
    if (!setting || typeof setting !== 'object' || Array.isArray(setting)) {
        throw new Error('persistentCache: expected false, true or a settings object');
    }
    const allowed = [
        'modes',
        'directory',
        'version',
        'buildDependencies',
        'env',
        'portable',
        'readonly',
    ];

    Object.keys(setting).forEach((key) => {
        if (!allowed.includes(key)) throw new Error(`persistentCache: unknown setting "${key}"`);
    });
    if (
        setting.modes !== undefined &&
        (!Array.isArray(setting.modes) ||
            !setting.modes.length ||
            setting.modes.some((mode) => !['dev', 'production'].includes(mode)))
    ) {
        throw new Error('persistentCache.modes: expected a non-empty array of dev / production');
    }
    (['directory', 'version'] as const).forEach((key) => {
        if (
            setting[key] !== undefined &&
            (typeof setting[key] !== 'string' || (key === 'directory' && !setting[key]))
        )
            throw new Error(`persistentCache.${key}: expected a string`);
    });
    (['portable', 'readonly'] as const).forEach((key) => {
        if (setting[key] !== undefined && typeof setting[key] !== 'boolean')
            throw new Error(`persistentCache.${key}: expected a boolean`);
    });
    (['buildDependencies', 'env'] as const).forEach((key) => {
        if (
            setting[key] !== undefined &&
            (!Array.isArray(setting[key]) ||
                setting[key]?.some((value) => typeof value !== 'string' || !value))
        )
            throw new Error(`persistentCache.${key}: expected an array of strings`);
    });
    setting.buildDependencies?.forEach((dependency) => {
        if (!fs.existsSync(path.resolve(config.cwd, dependency)))
            throw new Error(`persistentCache.buildDependencies: missing path "${dependency}"`);
    });

    return setting;
}

export function cacheDirectory(config: AppContextWithConfigs): string {
    const directory = path.resolve(
        config.cwd,
        cacheSettings(config)?.directory || DEFAULT_CACHE_DIRECTORY,
    );
    const build = path.resolve(config.cwd, config.buildPath);
    const forbidden = [
        path.parse(directory).root,
        os.homedir(),
        config.cwd,
        config.appNodeModules,
        path.dirname(config.cwd),
    ];

    if (
        forbidden.includes(directory) ||
        containsPath(directory, config.cwd) ||
        containsPath(directory, build) ||
        containsPath(build, directory) ||
        containsPath(directory, config.appNodeModules)
    ) {
        throw new Error(
            `persistentCache.directory: unsafe directory "${directory}"; use a dedicated cache directory outside buildPath`,
        );
    }

    // Refuse symlinks in the path, including missing descendants of an existing symlink.
    let current = directory;

    while (current !== path.dirname(current)) {
        if (
            fs.existsSync(current) &&
            fs.lstatSync(current).isSymbolicLink() &&
            !containsPath(current, config.cwd)
        )
            throw new Error(`persistentCache.directory: symlink is not allowed: ${current}`);
        current = path.dirname(current);
    }

    return directory;
}
