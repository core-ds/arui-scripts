import {
    getInstallProductionCommand as dockerGetInstallProductionCommand,
    getPruningCommand as dockerGetPruningCommand,
    getYarnBinSymlinkCommand as dockerGetYarnBinSymlinkCommand,
    getYarnPathFromRc as dockerGetYarnPathFromRc,
    getYarnVersion as dockerGetYarnVersion,
    type YarnVersion,
} from '@alfalab/arui-scripts-artifacts';

import { configs } from '../../configs/app-configs';

/**
 * Совместимый слой поверх @alfalab/arui-scripts-artifacts: сохраняет исторические сигнатуры без аргументов,
 * подставляя значения из глобального `configs`.
 *
 * @deprecated Используйте одноименные функции из `@alfalab/arui-scripts-artifacts`.
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

/**
 * Читает значение yarnPath из .yarnrc.yml.
 * Возвращает путь к бинарнику yarn (например .yarn/releases/yarn-4.18.0.cjs) или null.
 */
export function getYarnPathFromRc(): string | null {
    return dockerGetYarnPathFromRc(configs.cwd);
}

/**
 * Возвращает команду для создания symlink на yarn бинарник в Docker-образе.
 * Используется при yarn 2+ с yarnPath в .yarnrc.yml, чтобы yarn был доступен
 * в PATH внутри Docker-образов (где yarn не установлен глобально).
 * Возвращает пустую строку, если symlink не нужен.
 */
export function getYarnBinSymlinkCommand(): string {
    return dockerGetYarnBinSymlinkCommand({ yarnVersion: getYarnVersion(), cwd: configs.cwd });
}
