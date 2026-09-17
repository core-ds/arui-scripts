import { type ResolvedNginxBaseConf } from '../config/types';

/** Имя файла с nginx-конфигом сервера (server-блок), который кладется в артефакт. */
export const NGINX_CONFIG_FILENAME = 'nginx.conf';

/** Имя файла с базовым nginx-конфигом (http-блок), который кладется в артефакт. */
export const BASE_NGINX_CONFIG_FILENAME = 'base-nginx.conf';

/** Порт, который nginx слушает внутри контейнера. */
export const DEFAULT_NGINX_PORT = 8080;

/** Корень, из которого nginx раздает статику. */
export const DEFAULT_NGINX_ROOT_PATH = '/src';

/** Значения по умолчанию для базового конфига (http-блок). */
export const DEFAULT_NGINX_BASE_CONF: ResolvedNginxBaseConf = {
    workerProcesses: 2,
    workerRlimitNoFile: 20000,
    workerConnections: 19000,
    eventsUse: 'epoll',
    daemon: 'off',
};
