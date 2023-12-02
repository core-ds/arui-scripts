import merge from 'lodash.merge';

import { tryResolve } from '../util/resolve';

import { AppConfigs, AppContext } from './types';
import { validateSettingsKeys } from './validate-settings-keys';

const ES_MODULE = '__esModule';

export function updateWithPresets(config: AppConfigs, context: AppContext) {
    if (!config.presets) return config;

    let appConfig = config;
    const presetsConfigPath = tryResolve(`${appConfig.presets}/arui-scripts.config`, {
        paths: [context.cwd],
    });
    const presetsOverridesPath = tryResolve(`${appConfig.presets}/arui-scripts.overrides`, {
        paths: [context.cwd],
    });

    if (presetsConfigPath) {
        // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires, global-require
        let presetsSettings = require(presetsConfigPath);

        if (ES_MODULE in presetsSettings) {
            // ts-node импортирует esModules, из них надо вытягивать default именно так
            presetsSettings = presetsSettings.default;
        }
        validateSettingsKeys(appConfig, presetsSettings, presetsConfigPath);

        appConfig = merge(appConfig, presetsSettings);
    }
    if (presetsOverridesPath) {
        context.overridesPath.unshift(presetsOverridesPath);
    }

    return appConfig;
}