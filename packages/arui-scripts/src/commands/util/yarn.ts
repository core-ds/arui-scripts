import { configs } from '../../configs/app-configs';

import { getCommandOutput } from './exec';

type YarnVersion = '1' | '2+' | 'unavailable';

export function getYarnVersion(): YarnVersion {
    if (configs.useYarn) {
        const yarnVersion = getCommandOutput('yarn -v');

        if (yarnVersion) {
            const yarnMajorVersion = Number(yarnVersion.split('.')[0]);

            return yarnMajorVersion > 1 ? '2+' : '1';
        }
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
