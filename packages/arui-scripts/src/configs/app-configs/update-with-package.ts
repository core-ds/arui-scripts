import merge from 'lodash.merge';

import { AppConfigs, AppContext } from './types';
import { validateSettingsKeys } from './validate-settings-keys';

export function updateWithPackage(config: AppConfigs, context: AppContext) {
    const packageSettings = context.appPackage.aruiScripts || {};

    validateSettingsKeys(config, packageSettings, 'package.json');

    return merge(config, packageSettings);
}
