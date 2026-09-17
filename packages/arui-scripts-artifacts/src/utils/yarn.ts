import path from 'path';

import fs from 'fs-extra';
import shell from 'shelljs';

import { type YarnVersion } from '../config/types';

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

type GetYarnBinSymlinkCommandParams = {
    yarnVersion: YarnVersion;
    cwd: string;
};

/**
 * Читает значение yarnPath из .yarnrc.yml.
 * Возвращает путь к бинарнику yarn (например .yarn/releases/yarn-4.18.0.cjs) или null.
 */
export function getYarnPathFromRc(cwd: string): string | null {
    const rcPath = path.join(cwd, '.yarnrc.yml');

    if (!shell.test('-f', rcPath)) {
        return null;
    }

    let content: string;

    try {
        content = fs.readFileSync(rcPath, 'utf8');
    } catch {
        return null;
    }

    // Ищем строку вида: yarnPath: .yarn/releases/yarn-4.18.0.cjs
    // Значение может быть в кавычках или без
    const match = content.match(/^\s*yarnPath:\s*['"]?([^'"\s]+)['"]?\s*$/m);

    return match ? match[1] : null;
}

/**
 * Возвращает команду для создания symlink на yarn бинарник в Docker-образе.
 * Используется при yarn 2+ с yarnPath в .yarnrc.yml, чтобы yarn был доступен
 * в PATH внутри Docker-образов (где yarn не установлен глобально).
 * Возвращает пустую строку, если symlink не нужен.
 */
export function getYarnBinSymlinkCommand({
    yarnVersion,
    cwd,
}: GetYarnBinSymlinkCommandParams): string {
    if (yarnVersion !== '2+') {
        return '';
    }

    const yarnPath = getYarnPathFromRc(cwd);

    if (!yarnPath) {
        return '';
    }

    // WORKDIR в Dockerfile = /src
    return `ln -sf /src/${yarnPath} /usr/local/bin/yarn && \\\n    `;
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
