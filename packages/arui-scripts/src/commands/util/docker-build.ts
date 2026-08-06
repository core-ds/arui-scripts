import path from 'path';

import {
    type BuildParams,
    dockerVersionSatisfies,
    getBuildParams,
    getBuildParamsFromArgs as artifactsGetBuildParamsFromArgs,
    getDockerBuildCommand as artifactsGetBuildCommand,
    prepareFilesForDocker as artifactsPrepareFilesForDocker,
} from '@alfalab/scripts-artifacts';

import { getResolvedArtifactsConfig } from './artifacts-options';

export { dockerVersionSatisfies };

/**
 * Совместимый слой поверх @alfalab/scripts-artifacts: сохраняет исторические сигнатуры, которыми
 * пользуются сторонние сборки и реэкспорт из `arui-scripts`.
 *
 * @deprecated Используйте одноименные функции из `@alfalab/scripts-artifacts` — они принимают явный
 * конфиг и не зависят от глобального `configs`. В следующей мажорной версии реэкспорт будет удален.
 */
export function getBuildParamsFromArgs(): BuildParams {
    return artifactsGetBuildParamsFromArgs(getResolvedArtifactsConfig(), process.argv.slice(3));
}

/**
 * Разбирает `registry/name:version` обратно на имя и версию, чтобы собрать конфиг, из которого
 * @alfalab/scripts-artifacts соберет ровно ту же строку.
 */
function splitImageFullName(imageFullName: string) {
    const lastColon = imageFullName.lastIndexOf(':');
    const lastSlash = imageFullName.lastIndexOf('/');

    if (lastColon > lastSlash) {
        return {
            name: imageFullName.slice(0, lastColon),
            version: imageFullName.slice(lastColon + 1),
        };
    }

    return { name: imageFullName, version: '' };
}

type PrepareFilesForDockerParams = {
    dockerfileTemplate: string;
    nginxConfTemplate: string;
    nginxBaseConfTemplate: string;
    startScriptTemplate: string;
    pathToTempDir: string;
    allowLocalDockerfile: boolean;
    allowLocalStartScript: boolean;
    addNodeModulesToDockerIgnore: boolean;
};

/**
 * @deprecated Используйте `prepareFilesForDocker` из `@alfalab/scripts-artifacts`. В следующей
 * мажорной версии реэкспорт будет удален.
 */
export async function prepareFilesForDocker({
    dockerfileTemplate,
    nginxConfTemplate,
    nginxBaseConfTemplate,
    startScriptTemplate,
    pathToTempDir,
    allowLocalDockerfile,
    allowLocalStartScript,
    addNodeModulesToDockerIgnore,
}: PrepareFilesForDockerParams) {
    const config = getResolvedArtifactsConfig();

    return artifactsPrepareFilesForDocker({
        config: {
            ...config,
            cwd: path.dirname(pathToTempDir),
            docker: {
                ...config.docker,
                tempDirName: path.basename(pathToTempDir),
                addNodeModulesToDockerIgnore,
            },
            localFiles: {
                ...config.localFiles,
                allowDockerfile: allowLocalDockerfile,
                allowStartScript: allowLocalStartScript,
            },
        },
        templates: {
            dockerfile: dockerfileTemplate,
            nginxConf: nginxConfTemplate,
            nginxBaseConf: nginxBaseConfTemplate,
            startScript: startScriptTemplate,
        },
    });
}

type DockerBuildCommandParams = {
    tempDirName: string;
    imageFullName: string;
};

/**
 * @deprecated Используйте `getDockerBuildCommand` из `@alfalab/scripts-artifacts`. В следующей
 * мажорной версии реэкспорт будет удален.
 */
export function getDockerBuildCommand({ tempDirName, imageFullName }: DockerBuildCommandParams) {
    const config = getResolvedArtifactsConfig();

    return artifactsGetBuildCommand({
        ...config,
        ...splitImageFullName(imageFullName),
        // имя образа уже содержит registry, второй раз подставлять его не нужно
        docker: { ...config.docker, registry: '', tempDirName },
    });
}

export { getBuildParams };
