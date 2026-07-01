import path from 'path';

import fs from 'fs-extra';
import satisfies from 'semver/functions/satisfies';
import shell from 'shelljs';

import {
    BASE_NGINX_CONFIG_FILENAME,
    DEFAULT_PLATFORM,
    NGINX_CONFIG_FILENAME,
    PLATFORM_FLAG_MIN_DOCKER_VERSION,
} from '../constants';
import { type RenderedDockerTemplates, type ResolvedDockerConfig } from '../types';

export type BuildParams = {
    pathToTempDir: string;
    imageFullName: string;
    tempDirName: string;
};

/**
 * Собирает параметры сборки (полное имя образа и пути) из конфига.
 */
export function getBuildParams(config: ResolvedDockerConfig): BuildParams {
    const { dockerRegistry, name, version, cwd, tempDirName } = config;
    const pathToTempDir = path.join(cwd, tempDirName);
    const imageFullName = `${dockerRegistry ? `${dockerRegistry}/` : ''}${name}:${version}`;

    return { pathToTempDir, imageFullName, tempDirName };
}

/**
 * Разбирает аргументы командной строки вида `name=... version=... registry=...` и накладывает их
 * поверх конфига. Неизвестные аргументы игнорируются с предупреждением.
 */
export function applyCommandLineArguments(
    config: ResolvedDockerConfig,
    commandLineArguments: string[],
): ResolvedDockerConfig {
    const next = { ...config };

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
                next.dockerRegistry = argValue;
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
    config: ResolvedDockerConfig,
    argv: string[] = process.argv.slice(3),
): BuildParams {
    return getBuildParams(applyCommandLineArguments(config, argv));
}

type PrepareFilesForDockerParams = {
    config: ResolvedDockerConfig;
    templates: RenderedDockerTemplates;
};

/**
 * Готовит временную директорию со всеми файлами, необходимыми для `docker build`: Dockerfile,
 * nginx-конфиги и start.sh. Локальные файлы проекта (если разрешены и заданы) имеют приоритет над
 * сгенерированными шаблонами.
 */
export async function prepareFilesForDocker({ config, templates }: PrepareFilesForDockerParams) {
    const {
        cwd,
        nginx,
        localFiles,
        allowLocalDockerfile,
        allowLocalStartScript,
        addNodeModulesToDockerIgnore,
    } = config;
    const { pathToTempDir } = getBuildParams(config);

    await fs.emptyDir(pathToTempDir);

    let nginxBaseConf = '';

    if (nginx) {
        nginxBaseConf = localFiles.nginxBaseConf
            ? await fs.readFile(localFiles.nginxBaseConf, 'utf8')
            : templates.nginxBaseConf;
    }

    const nginxConf = localFiles.nginxConf
        ? await fs.readFile(localFiles.nginxConf, 'utf8')
        : templates.nginxConf;

    const dockerfile =
        localFiles.dockerfile && allowLocalDockerfile
            ? await fs.readFile(localFiles.dockerfile, 'utf8')
            : templates.dockerfile;

    const startScript =
        localFiles.startScript && allowLocalStartScript
            ? await fs.readFile(localFiles.startScript, 'utf8')
            : templates.startScript;

    const dockerIgnoreFilePath = path.join(cwd, '.dockerignore');

    const dockerIgnoreFileContent =
        addNodeModulesToDockerIgnore &&
        (await getAndModifyDockerIgnoreContent(dockerIgnoreFilePath));

    await Promise.all(
        [
            fs.writeFile(path.join(pathToTempDir, 'Dockerfile'), dockerfile, 'utf8'),
            fs.writeFile(path.join(pathToTempDir, NGINX_CONFIG_FILENAME), nginxConf, 'utf8'),
            nginxBaseConf &&
                fs.writeFile(
                    path.join(pathToTempDir, BASE_NGINX_CONFIG_FILENAME),
                    nginxBaseConf,
                    'utf8',
                ),
            fs.writeFile(path.join(pathToTempDir, 'start.sh'), startScript, {
                encoding: 'utf8',
                mode: 0o555,
            }),
            addNodeModulesToDockerIgnore &&
                dockerIgnoreFileContent &&
                fs.writeFile(dockerIgnoreFilePath, dockerIgnoreFileContent, 'utf-8'),
        ].filter(Boolean),
    );
}

/**
 * Проверяет, что версия docker (клиент и сервер) удовлетворяет semver-диапазону.
 */
export function dockerVersionSatisfies(request: string) {
    const dockerServerVersion = shell.exec("docker version --format '{{.Server.Version}}'", {
        silent: true,
    });
    const dockerClientVersion = shell.exec("docker version --format '{{.Client.Version}}'", {
        silent: true,
    });

    return (
        satisfies(dockerServerVersion.toString(), request) &&
        satisfies(dockerClientVersion.toString(), request)
    );
}

/**
 * Вычисляет значение флага `--platform` согласно настройке `platform` в конфиге.
 */
export function getPlatformFlag(config: ResolvedDockerConfig): string {
    const { platform } = config;

    if (platform === 'auto') {
        // на маках с m1 без флага docker пытается вытянуть базовый образ под свою платформу и падает,
        // но сам флаг поддерживается без экспериментальных флагов только начиная с docker 20.10.21.
        return dockerVersionSatisfies(PLATFORM_FLAG_MIN_DOCKER_VERSION)
            ? `--platform ${DEFAULT_PLATFORM}`
            : '';
    }

    if (platform) {
        return `--platform ${platform}`;
    }

    return '';
}

/**
 * Формирует команду `docker build` для сгенерированной ранее временной директории.
 */
export function getDockerBuildCommand(config: ResolvedDockerConfig): string {
    const { tempDirName, context, extraBuildArgs } = config;
    const { imageFullName } = getBuildParams(config);

    const platformFlag = getPlatformFlag(config);

    const extraArgs = Object.entries(extraBuildArgs)
        .map(([key, value]) => `--build-arg ${key}="${value}"`)
        .join(' ');

    return `docker build ${platformFlag} \
    -f "./${tempDirName}/Dockerfile" \
    --build-arg START_SH_LOCATION="./${tempDirName}/start.sh" \
    --build-arg NGINX_CONF_LOCATION="./${tempDirName}/${NGINX_CONFIG_FILENAME}" \
    --build-arg NGINX_BASE_CONF_LOCATION="./${tempDirName}/${BASE_NGINX_CONFIG_FILENAME}" \
    ${extraArgs} \
    -t ${imageFullName} ${context}`;
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
