import fs from 'fs';
import path from 'path';

import shell from 'shelljs';

import { configs } from '../../configs/app-configs';

type YarnVersion = '1' | '2+' | 'unavailable';

export function getYarnVersion(): YarnVersion {
    if (configs.useYarn && shell.which('yarn')) {
        const yarnVersion = shell.exec('yarn -v', { silent: true });
        const yarnMajorVersion = Number(yarnVersion.split('.')[0]);

        return yarnMajorVersion > 1 ? '2+' : '1';
    }

    return 'unavailable';
}

export function getPruningCommand(): string {
    if (configs.clientOnly) {
        return 'echo "Skipping pruning in client only mode"';
    }
    const yarnVersion = getYarnVersion();

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

export function getInstallProductionCommand(): string {
    const yarnVersion = getYarnVersion();

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

/**
 * Читает значение yarnPath из .yarnrc.yml.
 * Возвращает путь к бинарнику yarn (например .yarn/releases/yarn-4.18.0.cjs) или null.
 */
export function getYarnPathFromRc(): string | null {
    const rcPath = path.join(configs.cwd, '.yarnrc.yml');

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
export function getYarnBinSymlinkCommand(): string {
    if (getYarnVersion() !== '2+') {
        return '';
    }

    const yarnPath = getYarnPathFromRc();

    if (!yarnPath) {
        return '';
    }

    // WORKDIR в Dockerfile = /src
    return `ln -sf /src/${yarnPath} /usr/local/bin/yarn && \\\n    `;
}
