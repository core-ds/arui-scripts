import fs from 'fs-extra';

import {
    applyCommandLineArguments,
    getBuildParams,
    getDockerBuildCommand,
    prepareFilesForDocker,
} from './utils/docker-build';
import { exec } from './utils/exec';
import { resolveArtifactsConfig } from './config';
import { type BeforeBuildHook, runHostPipeline } from './host-pipeline';
import { renderTemplates } from './render';
import { type ArtifactsOptions } from './types';

export type BuildDockerImageOptions = ArtifactsOptions & {
    /** Аргументы командной строки (`name=... version=... registry=...`), накладываются поверх опций. */
    argv?: string[];
    /**
     * Хук, вызываемый после подготовки файлов и очистки `buildPath`, но до сборки приложения и
     * `docker build`. Если приложение собирается им, выставьте `buildCommand: null`.
     */
    beforeBuild?: BeforeBuildHook;
};

/**
 * Высокоуровневая сборка docker-образа. Повторяет пайплайн команд `arui-scripts docker-build` и
 * `arui-scripts docker-build:compiled`: донасыщает конфиг, рендерит все шаблоны, готовит временную
 * директорию, прогоняет хост-пайплайн, запускает `docker build`, чистит за собой и (опционально)
 * пушит образ.
 *
 * Для более тонкого контроля используйте отдельные утилиты: {@link resolveArtifactsConfig},
 * {@link renderTemplates}, {@link prepareFilesForDocker}, {@link getDockerBuildCommand}.
 */
export async function buildDockerImage(options: BuildDockerImageOptions = {}): Promise<void> {
    const { argv, beforeBuild, templates, overrides, ...rest } = options;

    let config = resolveArtifactsConfig({ ...rest, artifact: 'docker' });

    if (argv) {
        config = applyCommandLineArguments(config, argv);
    }

    const { imageFullName, pathToTempDir } = getBuildParams(config);

    let restoreDockerIgnore: (() => Promise<void>) | null = null;

    try {
        console.log(`Build docker image ${imageFullName}`);
        console.time('Total time');
        console.time('Setting up time');

        const renderedTemplates = renderTemplates({ config, templates, overrides });

        ({ restoreDockerIgnore } = await prepareFilesForDocker({
            config,
            templates: renderedTemplates,
        }));

        console.timeEnd('Setting up time');

        await runHostPipeline(config, beforeBuild);

        console.time('Build docker image time');
        await exec(getDockerBuildCommand(config));
        console.timeEnd('Build docker image time');

        console.time('Cleanup time');
        await fs.remove(pathToTempDir);
        await restoreDockerIgnore();
        restoreDockerIgnore = null;

        if (config.push) {
            await exec(`docker push ${imageFullName}`);
        }

        console.timeEnd('Cleanup time');
        console.timeEnd('Total time');
    } catch (err) {
        await fs.remove(pathToTempDir);
        await restoreDockerIgnore?.();
        console.error('Error during docker-build.');
        if (config.debug) {
            console.error(err);
        }
        throw err;
    }
}
