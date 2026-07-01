import fs from 'fs-extra';

import {
    applyCommandLineArguments,
    getBuildParams,
    getDockerBuildCommand,
    prepareFilesForDocker,
} from './utils/docker-build';
import { exec } from './utils/exec';
import { resolveDockerConfig } from './config';
import { type DockerfileVariant, renderDockerTemplates } from './render';
import { type DockerBuildOptions, type ResolvedDockerConfig } from './types';

export type BuildDockerImageOptions = DockerBuildOptions & {
    /** Вариант Dockerfile: `runtime` (по умолчанию) или `compiled`. */
    variant?: DockerfileVariant;
    /** Аргументы командной строки (`name=... version=... registry=...`), накладываются поверх опций. */
    argv?: string[];
    /** Хук, вызываемый после подготовки файлов, но до `docker build` (например, для сборки приложения). */
    beforeBuild?: (config: ResolvedDockerConfig) => void | Promise<void>;
};

/**
 * Высокоуровневая сборка docker-образа: донасыщает конфиг, рендерит все шаблоны, готовит временную
 * директорию, запускает `docker build`, чистит за собой и (опционально) пушит образ.
 *
 * Для более тонкого контроля используйте отдельные утилиты: {@link resolveDockerConfig},
 * {@link renderDockerTemplates}, {@link prepareFilesForDocker}, {@link getDockerBuildCommand}.
 */
export async function buildDockerImage(options: BuildDockerImageOptions = {}): Promise<void> {
    const { variant = 'runtime', argv, beforeBuild, templates, overrides, ...rest } = options;

    let config = resolveDockerConfig(rest);

    if (argv) {
        config = applyCommandLineArguments(config, argv);
    }

    const { imageFullName, pathToTempDir } = getBuildParams(config);

    try {
        console.log(`Build docker image ${imageFullName}`);
        console.time('Total time');

        const renderedTemplates = renderDockerTemplates({ config, variant, templates, overrides });

        await prepareFilesForDocker({ config, templates: renderedTemplates });

        if (beforeBuild) {
            await beforeBuild(config);
        }

        await exec(getDockerBuildCommand(config));
        await fs.remove(pathToTempDir);

        if (config.push) {
            await exec(`docker push ${imageFullName}`);
        }

        console.timeEnd('Total time');
    } catch (err) {
        await fs.remove(pathToTempDir);
        console.error('Error during docker-build.');
        if (config.debug) {
            console.error(err);
        }
        throw err;
    }
}
