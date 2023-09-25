import merge from 'lodash.merge';

import { readConfigFile } from './read-config-file';
import { AppConfigs, AppContext } from './types';
import { validateSettingsKeys } from './validate-settings-keys';

export function updateWithConfigFile(config: AppConfigs, context: AppContext) {
    const appSettings = readConfigFile(context.cwd);

    if (appSettings) {
        validateSettingsKeys(config, appSettings, context.cwd);

        return merge(config, appSettings);
    }

    return config;
}
