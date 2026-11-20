import fs from 'fs';
import path from 'path';

import ts from 'typescript';

import { getConfigFilePath } from '../app-configs/read-config-file';
import { type AppContextWithConfigs } from '../app-configs/types';
import { getPresetsConfigPath } from '../app-configs/update-with-presets';

import { cacheSettings } from './settings';

/** Collect configuration inputs, including JSONC and package-based TypeScript extends. */
export function cacheDependencies(config: AppContextWithConfigs): string[] {
    const files = new Set<string>();
    const add = (file: string) => {
        if (fs.existsSync(file)) files.add(file);
    };

    for (
        let directory = config.cwd;
        directory;
        directory = directory === path.dirname(directory) ? '' : path.dirname(directory)
    ) {
        for (const name of [
            'package.json',
            'yarn.lock',
            'package-lock.json',
            'pnpm-lock.yaml',
            'bun.lock',
            'bun.lockb',
            '.browserslistrc',
            'browserslist',
        ])
            add(path.join(directory, name));
    }
    const roots = [
        getConfigFilePath(config.cwd),
        config.presets ? getPresetsConfigPath(config, config.cwd) : undefined,
        ...config.overridesPath,
    ];
    const visited = new Set<string>();
    const visitModule = (filename: string) => {
        if (visited.has(filename)) return;
        visited.add(filename);
        add(filename);
        require.cache[filename]?.children.forEach((child) => visitModule(child.filename));
    };

    roots.forEach((filename) => {
        if (filename) visitModule(filename);
    });
    if (config.tsconfig) {
        ts.getParsedCommandLineOfConfigFile(
            config.tsconfig,
            {},
            {
                ...ts.sys,
                readDirectory: () => [],
                readFile: (file) => {
                    add(file);

                    return ts.sys.readFile(file);
                },
                onUnRecoverableConfigFileDiagnostic: () => {},
            },
        );
    }
    if (process.env.BROWSERSLIST_CONFIG)
        add(path.resolve(config.cwd, process.env.BROWSERSLIST_CONFIG));
    if (config.componentsTheme) {
        const theme = path.resolve(config.cwd, config.componentsTheme);

        if (fs.existsSync(theme)) add(theme);
        else add(require.resolve(config.componentsTheme, { paths: [config.cwd] }));
    }
    config.dictionaryCompression.dictionaryPath.forEach((file) =>
        add(path.resolve(config.cwd, file)),
    );
    cacheSettings(config)?.buildDependencies?.forEach((file) =>
        add(path.resolve(config.cwd, file)),
    );
    // Also invalidate local changes to the installed arui code, including linked development builds.
    add(path.resolve(__dirname, '../../../package.json'));
    add(path.resolve(__dirname, '../..'));

    return [...files].sort();
}

export function linkedDependencyPaths(config: AppContextWithConfigs): string[] {
    const paths = new Set<string>();
    const names = Object.keys({
        ...config.appPackage.dependencies,
        ...config.appPackage.devDependencies,
    });

    names.forEach((name) => {
        const candidate = path.join(config.appNodeModules, name);

        if (fs.existsSync(candidate) && fs.lstatSync(candidate).isSymbolicLink()) {
            paths.add(candidate);
            paths.add(fs.realpathSync(candidate));
        }
    });

    return [...paths];
}
