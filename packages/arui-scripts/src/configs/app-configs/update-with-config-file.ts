// TODO: remove eslint-disable-next-line
import path from 'path';

import merge from 'lodash.merge';

import { tryResolve } from '../util/resolve';

import { AppConfigs, AppContext } from './types';
import { validateSettingsKeys } from './validate-settings-keys';

export function updateWithConfigFile(config: AppConfigs, context: AppContext) {
    const appConfigPath = tryResolve(path.join(context.cwd, '/arui-scripts.config'));

    if (appConfigPath) {
        // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
        let appSettings = require(appConfigPath);

        // eslint-disable-next-line no-underscore-dangle
        if (appSettings.__esModule) {
            // ts-node импортирует esModules, из них надо вытягивать default именно так
            appSettings = appSettings.default;
        }
        validateSettingsKeys(config, appSettings, appConfigPath);

        return merge(config, appSettings);
    }

    return config;
}
