import path from 'path';

import fs from 'fs-extra';
import { create as createTar } from 'tar';

import { resolveArtifactsConfig } from './config';
import { NGINX_CONFIG_FILENAME } from './constants';
import { type BeforeBuildHook, runHostPipeline } from './host-pipeline';
import { renderTemplates } from './render';
import { type ArtifactsOptions, type ResolvedArtifactsConfig } from './types';

export type BuildArchiveOptions = ArtifactsOptions & {
    /** Хук, вызываемый после очистки `buildPath`, но до сборки приложения. */
    beforeBuild?: BeforeBuildHook;
};

const START_SCRIPT_FILENAME = 'start.sh';
const NODE_MODULES_DIR_NAME = 'node_modules';
const PACKAGE_JSON_FILENAME = 'package.json';

/**
 * Собирает tar-архив с production-сборкой: nginx-конфиг, start.sh, `buildPath`, `node_modules`,
 * `package.json` и дополнительные директории из `additionalBuildPath`.
 *
 * Хост-пайплайн (очистка, сборка, удаление dev-зависимостей) — тот же, что у docker-образа, поэтому
 * архив и образ собираются из одного и того же состояния проекта.
 */
export async function buildArchive(options: BuildArchiveOptions = {}): Promise<void> {
    const { beforeBuild, templates, overrides, ...rest } = options;

    const config: ResolvedArtifactsConfig = resolveArtifactsConfig({
        ...rest,
        artifact: 'archive',
    });

    const {
        cwd,
        tempDirName,
        buildPath,
        archiveName,
        additionalBuildPath,
        localFiles,
        allowLocalStartScript,
    } = config;

    const pathToTempDir = path.join(cwd, tempDirName);

    try {
        console.log(`Build archive ${archiveName}`);
        console.time('Total time');
        console.time('Setting up time');

        const rendered = renderTemplates({ config, templates, overrides });

        await fs.emptyDir(pathToTempDir);

        const nginxConf = localFiles.nginxConf
            ? await fs.readFile(localFiles.nginxConf, 'utf8')
            : rendered.nginxConf;

        const startScript =
            localFiles.startScript && allowLocalStartScript
                ? await fs.readFile(localFiles.startScript, 'utf8')
                : rendered.startScript;

        await Promise.all([
            fs.writeFile(path.join(pathToTempDir, NGINX_CONFIG_FILENAME), nginxConf, 'utf8'),
            fs.writeFile(path.join(pathToTempDir, START_SCRIPT_FILENAME), startScript, {
                encoding: 'utf8',
                mode: 0o555,
            }),
        ]);

        console.timeEnd('Setting up time');

        await runHostPipeline(config, beforeBuild);

        console.time('Archive build time');

        await Promise.all([
            fs.copy(path.resolve(cwd, buildPath), path.join(pathToTempDir, buildPath)),
            fs.copy(
                path.join(cwd, NODE_MODULES_DIR_NAME),
                path.join(pathToTempDir, NODE_MODULES_DIR_NAME),
            ),
            fs.copy(
                path.join(cwd, PACKAGE_JSON_FILENAME),
                path.join(pathToTempDir, PACKAGE_JSON_FILENAME),
            ),
            ...additionalBuildPath.map((additionalPath) =>
                fs.copy(path.join(cwd, additionalPath), path.join(pathToTempDir, additionalPath)),
            ),
        ]);

        await createTar({ file: archiveName, cwd: pathToTempDir }, fs.readdirSync(pathToTempDir));

        console.timeEnd('Archive build time');
        console.time('Cleanup time');

        await fs.remove(pathToTempDir);

        console.timeEnd('Cleanup time');
        console.timeEnd('Total time');
    } catch (err) {
        await fs.remove(pathToTempDir);
        console.error('Error during archive-build.');
        if (config.debug) {
            console.error(err);
        }
        throw err;
    }
}
