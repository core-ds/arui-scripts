import path from 'path';
import merge from 'lodash.merge';
import { tryResolve } from '../util/resolve';
import { AppConfigs } from './types';
import validateSettingsKeys from './validate-settings-keys';
import { availablePackageSettings } from './available-package-settings';

export function updateWithConfigFile(config: AppConfigs) {
    const appConfigPath = tryResolve(path.join(config.cwd, '/arui-scripts.config'));

    if (appConfigPath) {
        let appSettings = require(appConfigPath);
        if (appSettings.__esModule) {
            // ts-node импортирует esModules, из них надо вытягивать default именно так
            appSettings = appSettings.default;
        }
        validateSettingsKeys(availablePackageSettings, appSettings);
        config = merge(config, appSettings);
    }

    return config;
}
