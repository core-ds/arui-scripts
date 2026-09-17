import path from 'path';

import { type ResolvedArtifactsConfig } from '../config/types';

export type BuildParams = {
    pathToTempDir: string;
    imageFullName: string;
    tempDirName: string;
};

/**
 * Собирает параметры сборки (полное имя образа и пути) из конфига.
 */
export function getBuildParams(config: ResolvedArtifactsConfig): BuildParams {
    const { name, version, cwd, docker } = config;
    const { registry, tempDirName } = docker;
    const pathToTempDir = path.join(cwd, tempDirName);
    const imageFullName = `${registry ? `${registry}/` : ''}${name}:${version}`;

    return { pathToTempDir, imageFullName, tempDirName };
}

/**
 * Разбирает аргументы командной строки вида `name=... version=... registry=...` и накладывает их
 * поверх конфига. Неизвестные аргументы игнорируются с предупреждением.
 */
export function applyCommandLineArguments(
    config: ResolvedArtifactsConfig,
    commandLineArguments: string[],
): ResolvedArtifactsConfig {
    const next = { ...config, docker: { ...config.docker } };

    commandLineArguments.forEach((arg) => {
        let [argName, argValue] = arg.split('=');

        argName = argName.toLowerCase().trim();
        argValue = argValue ? argValue.trim() : '';
        switch (argName) {
            case 'version':
                next.version = argValue;
                break;
            case 'name':
                next.name = argValue;
                break;
            case 'registry':
                next.docker.registry = argValue;
                break;
            default:
                console.warn(`Unknown argument ${argName}`);
        }
    });

    return next;
}

/**
 * Как {@link getBuildParams}, но с учетом аргументов командной строки (по умолчанию — `process.argv`,
 * начиная с третьего, как в CLI arui-scripts).
 */
export function getBuildParamsFromArgs(
    config: ResolvedArtifactsConfig,
    argv: string[] = process.argv.slice(3),
): BuildParams {
    return getBuildParams(applyCommandLineArguments(config, argv));
}
