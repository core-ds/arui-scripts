#! /usr/bin/env node
/* eslint-disable global-require, import/no-dynamic-require */
import path from 'path';

import fs from 'fs-extra';

import { buildDockerImage, type BuildDockerImageOptions } from '../build-docker-image';
import { BASE_NGINX_CONFIG_FILENAME, NGINX_CONFIG_FILENAME } from '../constants';
import { type DockerBuildOptions } from '../types';

const CONFIG_FILE_NAMES = [
    'arui-scripts-docker.config.js',
    'arui-scripts-docker.config.cjs',
    '.arui-scripts-docker.js',
];

/**
 * Пытается загрузить пользовательский конфиг из cwd. Конфиг может экспортировать объект опций или
 * функцию, возвращающую опции (в т.ч. асинхронно).
 */
async function loadUserOptions(cwd: string): Promise<DockerBuildOptions> {
    const configPath = CONFIG_FILE_NAMES.map((fileName) => path.join(cwd, fileName)).find(
        (filePath) => fs.existsSync(filePath),
    );

    if (!configPath) {
        return {};
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const required = require(configPath);
    // eslint-disable-next-line no-underscore-dangle
    const configModule = required?.__esModule ? required.default : required;

    return typeof configModule === 'function' ? configModule() : configModule;
}

/**
 * Определяет локальные файлы проекта, замещающие сгенерированные шаблоны, если они лежат в cwd.
 */
function detectLocalFiles(cwd: string): DockerBuildOptions['localFiles'] {
    const resolveIfExists = (fileName: string) => {
        const filePath = path.join(cwd, fileName);

        return fs.existsSync(filePath) ? filePath : null;
    };

    return {
        dockerfile: resolveIfExists('Dockerfile'),
        startScript: resolveIfExists('start.sh'),
        nginxConf: resolveIfExists(NGINX_CONFIG_FILENAME),
        nginxBaseConf: resolveIfExists(BASE_NGINX_CONFIG_FILENAME),
    };
}

const commandDefaults: Record<string, Partial<BuildDockerImageOptions>> = {
    'docker-build': {
        variant: 'runtime',
        allowLocalDockerfile: true,
        allowLocalStartScript: true,
        addNodeModulesToDockerIgnore: false,
    },
    'docker-build:compiled': {
        variant: 'compiled',
        allowLocalDockerfile: false,
        allowLocalStartScript: false,
        addNodeModulesToDockerIgnore: true,
    },
};

(async () => {
    const command = process.argv[2];

    if (!command || !commandDefaults[command]) {
        console.error(
            `Please specify one of available commands: ${Object.keys(commandDefaults)
                .map((c) => `"${c}"`)
                .join(' ')}`,
        );
        process.exit(-1);

        return;
    }

    const cwd = process.cwd();

    try {
        const userOptions = await loadUserOptions(cwd);
        const defaults = commandDefaults[command];

        await buildDockerImage({
            ...defaults,
            localFiles: { ...detectLocalFiles(cwd), ...userOptions.localFiles },
            ...userOptions,
            // аргументы командной строки (name=... version=... registry=...) имеют наивысший приоритет
            argv: process.argv.slice(3),
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
