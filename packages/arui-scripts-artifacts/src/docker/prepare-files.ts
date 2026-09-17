import path from 'path';

import fs from 'fs-extra';

import { type RenderedTemplates, type ResolvedArtifactsConfig } from '../config/types';
import { BASE_NGINX_CONFIG_FILENAME, NGINX_CONFIG_FILENAME } from '../nginx/constants';
import { START_SCRIPT_FILENAME } from '../start-script/constants';

import { getBuildParams } from './build-params';
import { DOCKERFILE_FILENAME, DOCKERIGNORE_FILENAME } from './constants';

type PrepareFilesForDockerParams = {
    config: ResolvedArtifactsConfig;
    templates: RenderedTemplates;
};

export type PrepareFilesForDockerResult = {
    /**
     * Возвращает `.dockerignore` проекта в исходное состояние. Вызывать после `docker build` —
     * иначе дописанный `node_modules` останется в рабочей копии пользователя.
     */
    restoreDockerIgnore: () => Promise<void>;
};

/**
 * Готовит временную директорию со всеми файлами, необходимыми для `docker build`: Dockerfile,
 * nginx-конфиги и start.sh. Локальные файлы проекта (если разрешены и заданы) имеют приоритет над
 * сгенерированными шаблонами.
 */
export async function prepareFilesForDocker({
    config,
    templates,
}: PrepareFilesForDockerParams): Promise<PrepareFilesForDockerResult> {
    const { cwd, nginx, localFiles, docker } = config;
    const { addNodeModulesToDockerIgnore } = docker;
    const { pathToTempDir } = getBuildParams(config);

    await fs.emptyDir(pathToTempDir);

    let nginxBaseConf = '';

    if (nginx.baseConf) {
        nginxBaseConf = localFiles.nginxBaseConf
            ? await fs.readFile(localFiles.nginxBaseConf, 'utf8')
            : templates.nginxBaseConf;
    }

    const nginxConf = localFiles.nginxConf
        ? await fs.readFile(localFiles.nginxConf, 'utf8')
        : templates.nginxConf;

    const dockerfile =
        localFiles.dockerfile && localFiles.allowDockerfile
            ? await fs.readFile(localFiles.dockerfile, 'utf8')
            : templates.dockerfile;

    const startScript =
        localFiles.startScript && localFiles.allowStartScript
            ? await fs.readFile(localFiles.startScript, 'utf8')
            : templates.startScript;

    const dockerIgnoreFilePath = path.join(cwd, DOCKERIGNORE_FILENAME);
    // запоминаем исходное состояние, чтобы вернуть файл как было: `node_modules` нужен только на
    // время сборки образа и не должен оставаться в рабочей копии
    const originalDockerIgnore =
        addNodeModulesToDockerIgnore && fs.existsSync(dockerIgnoreFilePath)
            ? await fs.readFile(dockerIgnoreFilePath, 'utf-8')
            : null;

    const dockerIgnoreFileContent =
        addNodeModulesToDockerIgnore &&
        (await getAndModifyDockerIgnoreContent(dockerIgnoreFilePath));

    await Promise.all(
        [
            fs.writeFile(path.join(pathToTempDir, DOCKERFILE_FILENAME), dockerfile, 'utf8'),
            fs.writeFile(path.join(pathToTempDir, NGINX_CONFIG_FILENAME), nginxConf, 'utf8'),
            nginxBaseConf &&
                fs.writeFile(
                    path.join(pathToTempDir, BASE_NGINX_CONFIG_FILENAME),
                    nginxBaseConf,
                    'utf8',
                ),
            fs.writeFile(path.join(pathToTempDir, START_SCRIPT_FILENAME), startScript, {
                encoding: 'utf8',
                mode: 0o555,
            }),
            addNodeModulesToDockerIgnore &&
                dockerIgnoreFileContent &&
                fs.writeFile(dockerIgnoreFilePath, dockerIgnoreFileContent, 'utf-8'),
        ].filter(Boolean),
    );

    return {
        restoreDockerIgnore: async () => {
            if (!addNodeModulesToDockerIgnore) {
                return;
            }

            if (originalDockerIgnore === null) {
                await fs.remove(dockerIgnoreFilePath);
            } else {
                await fs.writeFile(dockerIgnoreFilePath, originalDockerIgnore, 'utf-8');
            }
        },
    };
}

async function getAndModifyDockerIgnoreContent(dockerIgnoreFilePath: string) {
    if (fs.existsSync(dockerIgnoreFilePath)) {
        return fs
            .readFile(dockerIgnoreFilePath, 'utf-8')
            .then((ignores) => `${ignores}\nnode_modules`);
    }

    await fs.createFile(dockerIgnoreFilePath);

    return 'node_modules';
}
