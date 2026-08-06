import path from 'path';

import fs from 'fs-extra';
import shell from 'shelljs';

import { type YarnVersion } from '../types';

type GetYarnVersionParams = {
    useYarn: boolean;
};

/**
 * Определяет версию yarn, доступную в системе. Если yarn не используется/недоступен — `'unavailable'`.
 */
export function getYarnVersion({ useYarn }: GetYarnVersionParams): YarnVersion {
    if (useYarn && shell.which('yarn')) {
        const yarnVersion = shell.exec('yarn -v', { silent: true });
        const yarnMajorVersion = Number(yarnVersion.split('.')[0]);

        return yarnMajorVersion > 1 ? '2+' : '1';
    }

    return 'unavailable';
}

/**
 * Проверяет наличие `yarn.lock` в директории проекта. Используется как дефолт для `useYarn`.
 */
export function detectUseYarn(cwd: string): boolean {
    return fs.existsSync(path.join(cwd, 'yarn.lock'));
}

type GetPruningCommandParams = {
    yarnVersion: YarnVersion;
    clientOnly: boolean;
};

/**
 * Команда удаления dev-зависимостей перед копированием проекта в образ.
 */
export function getPruningCommand({ yarnVersion, clientOnly }: GetPruningCommandParams): string {
    if (clientOnly) {
        return 'echo "Skipping pruning in client only mode"';
    }

    switch (yarnVersion) {
        case '1': {
            return 'yarn install --production --ignore-optional --frozen-lockfile --ignore-scripts --prefer-offline';
        }
        case '2+': {
            return 'yarn workspaces focus --production --all';
        }
        case 'unavailable': {
            return 'npm prune --production';
        }
        default: {
            return '';
        }
    }
}

/**
 * Команда установки production-зависимостей внутри образа (для compiled-варианта).
 */
export function getInstallProductionCommand(yarnVersion: YarnVersion): string {
    switch (yarnVersion) {
        case '1': {
            return 'yarn install --production --ignore-optional --frozen-lockfile --ignore-scripts --prefer-offline';
        }
        case '2+': {
            return 'yarn workspaces focus --production --all';
        }
        case 'unavailable': {
            return 'npm install --production';
        }
        default: {
            return '';
        }
    }
}
