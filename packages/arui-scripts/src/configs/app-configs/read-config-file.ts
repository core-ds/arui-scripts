import path from 'path';

import { loadConfigFile } from '../util/load-config-file';
import { tryResolve } from '../util/resolve';

export function readConfigFile(cwd: string) {
    const appConfigPath = getConfigFilePath(cwd);

    if (appConfigPath) {
        let appSettings = loadConfigFile(appConfigPath);

        // Загрузчик возвращает ES-модули с default export в обёртке.
        // eslint-disable-next-line no-underscore-dangle
        if (appSettings.__esModule) {
            appSettings = appSettings.default;
        }

        return appSettings;
    }

    return null;
}

export function getConfigFilePath(cwd: string) {
    return tryResolve(path.join(cwd, '/arui-scripts.config'));
}
