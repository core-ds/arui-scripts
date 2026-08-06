import path from 'path';

import {
    type BuildParams,
    dockerVersionSatisfies,
    getBuildParams,
    getBuildParamsFromArgs as dockerGetBuildParamsFromArgs,
    getDockerBuildCommand as dockerGetBuildCommand,
    prepareFilesForDocker as dockerPrepareFilesForDocker,
} from '@alfalab/scripts-artifacts';

import { getResolvedArtifactsConfig } from './artifacts-options';

export { dockerVersionSatisfies };

/**
 * Совместимый слой поверх @alfalab/scripts-artifacts: сохраняет исторические сигнатуры, которыми
 * пользуются внешние потребители (в первую очередь newclick-builder) и реэкспорт из `arui-scripts`.
 *
 * @deprecated Используйте одноименные функции из `@alfalab/scripts-artifacts` — они принимают явный
 * конфиг и не зависят от глобального `configs`.
 */
export function getBuildParamsFromArgs(): BuildParams {
    return dockerGetBuildParamsFromArgs(getResolvedArtifactsConfig(), process.argv.slice(3));
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
 * @deprecated Используйте `prepareFilesForDocker` из `@alfalab/scripts-artifacts`.
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
    return dockerPrepareFilesForDocker({
        config: {
            ...getResolvedArtifactsConfig(),
            cwd: path.dirname(pathToTempDir),
            tempDirName: path.basename(pathToTempDir),
            allowLocalDockerfile,
            allowLocalStartScript,
            addNodeModulesToDockerIgnore,
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
 * @deprecated Используйте `getDockerBuildCommand` из `@alfalab/scripts-artifacts`.
 */
export function getDockerBuildCommand({ tempDirName, imageFullName }: DockerBuildCommandParams) {
    return dockerGetBuildCommand({
        ...getResolvedArtifactsConfig(),
        ...splitImageFullName(imageFullName),
        dockerRegistry: '',
        tempDirName,
    });
}

export { getBuildParams };
