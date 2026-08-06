import path from 'path';

import fs from 'fs-extra';

import { type ResolvedArtifactsConfig } from '../config/types';
import { exec } from '../utils/exec';

/** Хук, вызываемый после очистки `buildPath`, но до сборки приложения. */
export type BeforeBuildHook = (config: ResolvedArtifactsConfig) => void | Promise<void>;

/**
 * Шаги, которые выполняются на хосте перед упаковкой артефакта: очистка прошлой сборки, сборка
 * приложения и удаление dev-зависимостей. Общие для docker-образа и tar-архива — какие именно шаги
 * выполнятся, определяет секция `build` конфига.
 */
export async function runHostPipeline(
    config: ResolvedArtifactsConfig,
    beforeBuild?: BeforeBuildHook,
): Promise<void> {
    const { build, packageManager } = config;

    if (build.cleanBuildPath) {
        await fs.remove(path.resolve(config.cwd, config.buildPath));
    }

    if (beforeBuild) {
        await beforeBuild(config);
    }

    if (build.command) {
        console.time('Build application time');
        await exec(build.command);
        console.timeEnd('Build application time');
    }

    if (build.removeDevDependencies && packageManager.pruneCommand) {
        console.time('Remove dev dependencies time');
        await exec(packageManager.pruneCommand);
        console.timeEnd('Remove dev dependencies time');
    }
}
