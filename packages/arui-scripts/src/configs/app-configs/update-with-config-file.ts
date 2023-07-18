import path from 'path';
import { tryResolve } from '../util/resolve';
import { AppConfigs, AppContext } from './types';
import { validateSettingsKeys } from './validate-settings-keys';

export function updateWithConfigFile(config: AppConfigs, context: AppContext) {
    const appConfigPath = tryResolve(path.join(context.cwd, '/arui-scripts.config'));

    if (appConfigPath) {
        let appSettings = require(appConfigPath);
        if (appSettings.__esModule) {
            // ts-node импортирует esModules, из них надо вытягивать default именно так
            appSettings = appSettings.default;
        }
        validateSettingsKeys(config, appSettings, appConfigPath);
        return {
            ...config,
            ...appSettings,
        };
    }

    return config;
}
