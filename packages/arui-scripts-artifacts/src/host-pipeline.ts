import path from 'path';

import fs from 'fs-extra';

import { exec } from './utils/exec';
import { type ResolvedArtifactsConfig } from './types';

/** Хук, вызываемый после очистки `buildPath`, но до сборки приложения. */
export type BeforeBuildHook = (config: ResolvedArtifactsConfig) => void | Promise<void>;

/**
 * Шаги, которые выполняются на хосте перед упаковкой артефакта: очистка прошлой сборки, сборка
 * приложения и удаление dev-зависимостей. Общие для docker-образа и tar-архива — какие именно шаги
 * выполнятся, определяют `cleanBuildPath`, `buildCommand` и `removeDevDependencies`.
 */
export async function runHostPipeline(
    config: ResolvedArtifactsConfig,
    beforeBuild?: BeforeBuildHook,
): Promise<void> {
    if (config.cleanBuildPath) {
        await fs.remove(path.resolve(config.cwd, config.buildPath));
    }

    if (beforeBuild) {
        await beforeBuild(config);
    }

    if (config.buildCommand) {
        console.time('Build application time');
        await exec(config.buildCommand);
        console.timeEnd('Build application time');
    }

    if (config.removeDevDependencies && config.pruneCommand) {
        console.time('Remove dev dependencies time');
        await exec(config.pruneCommand);
        console.timeEnd('Remove dev dependencies time');
    }
}
