// именно default-импорт пакета целиком: semver — CommonJS без exports-карты, и Node ESM не умеет
// ни глубокий путь без расширения, ни именованные импорты из него
import semver from 'semver';
import shell from 'shelljs';

import { type ResolvedArtifactsConfig } from '../config/types';
import { BASE_NGINX_CONFIG_FILENAME, NGINX_CONFIG_FILENAME } from '../nginx/constants';
import { START_SCRIPT_FILENAME } from '../start-script/constants';
import { shellQuote } from '../utils/shell';

import { getBuildParams } from './build-params';
import {
    DEFAULT_PLATFORM,
    DOCKERFILE_FILENAME,
    PLATFORM_FLAG_MIN_DOCKER_VERSION,
} from './constants';

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
        semver.satisfies(dockerServerVersion.toString(), request) &&
        semver.satisfies(dockerClientVersion.toString(), request)
    );
}

/**
 * Вычисляет значение флага `--platform` согласно настройке `docker.platform` в конфиге.
 */
export function getPlatformFlag(config: ResolvedArtifactsConfig): string {
    const { platform } = config.docker;

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
export function getDockerBuildCommand(config: ResolvedArtifactsConfig): string {
    const { tempDirName, context, buildArgs } = config.docker;
    const { imageFullName } = getBuildParams(config);

    const platformFlag = getPlatformFlag(config);

    const extraArgs = Object.entries(buildArgs)
        .map(([key, value]) => `--build-arg ${key}=${shellQuote(value)}`)
        .join(' ');

    return `docker build ${platformFlag} \
    -f ${shellQuote(`./${tempDirName}/${DOCKERFILE_FILENAME}`)} \
    --build-arg START_SH_LOCATION=${shellQuote(`./${tempDirName}/${START_SCRIPT_FILENAME}`)} \
    --build-arg NGINX_CONF_LOCATION=${shellQuote(`./${tempDirName}/${NGINX_CONFIG_FILENAME}`)} \
    --build-arg NGINX_BASE_CONF_LOCATION=${shellQuote(
        `./${tempDirName}/${BASE_NGINX_CONFIG_FILENAME}`,
    )} \
    ${extraArgs} \
    -t ${shellQuote(imageFullName)} ${shellQuote(context)}`;
}
