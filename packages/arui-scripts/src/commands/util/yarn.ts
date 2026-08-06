import {
    getInstallProductionCommand as dockerGetInstallProductionCommand,
    getPruningCommand as dockerGetPruningCommand,
    getYarnVersion as dockerGetYarnVersion,
    type YarnVersion,
} from '@alfalab/scripts-artifacts';

import { configs } from '../../configs/app-configs';

/**
 * Совместимый слой поверх @alfalab/scripts-artifacts: сохраняет исторические сигнатуры без аргументов,
 * подставляя значения из глобального `configs`.
 *
 * @deprecated Используйте одноименные функции из `@alfalab/scripts-artifacts`.
 */
export function getYarnVersion(): YarnVersion {
    return dockerGetYarnVersion({ useYarn: configs.useYarn });
}

export function getPruningCommand(): string {
    return dockerGetPruningCommand({
        yarnVersion: getYarnVersion(),
        clientOnly: configs.clientOnly,
    });
}

export function getInstallProductionCommand(): string {
    return dockerGetInstallProductionCommand(getYarnVersion());
}
