/**
 * Имя временной директории, в которую складываются сгенерированные файлы (Dockerfile, nginx-конфиги,
 * start.sh) перед запуском `docker build`.
 */
export const DEFAULT_TEMP_DIR_NAME = '.docker-build';

/** Имя файла с nginx-конфигом сервера (server-блок), который кладется в образ. */
export const NGINX_CONFIG_FILENAME = 'nginx.conf';

/** Имя файла с базовым nginx-конфигом (http-блок), который кладется в образ. */
export const BASE_NGINX_CONFIG_FILENAME = 'base-nginx.conf';

/** Имя файла с рантайм-конфигом клиентского приложения. */
export const ENV_CONFIG_FILENAME = 'env-config.json';

/** Базовый docker-образ по умолчанию. */
export const DEFAULT_BASE_DOCKER_IMAGE = 'alfabankui/arui-scripts:24.10.0-slim';

/**
 * Минимальная версия docker, начиная с которой флаг `--platform` поддерживается без экспериментальных
 * флагов. На многих серверах до сих пор живет docker 1.13.1, который упадет при наличии этого флага.
 * @see https://docs.docker.com/engine/release-notes/20.10/
 */
export const PLATFORM_FLAG_MIN_DOCKER_VERSION = '>=20.10.21';

/** Значение флага `--platform`, которое подставляется при `platform: 'auto'` на новых версиях docker. */
export const DEFAULT_PLATFORM = 'linux/x86_64';
