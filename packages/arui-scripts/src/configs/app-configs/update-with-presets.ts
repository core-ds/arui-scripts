// TODO: remove eslint-disable-next-line
import merge from 'lodash.merge';

import { loadConfigFile } from '../util/load-config-file';
import { tryResolve } from '../util/resolve';

import { type AppConfigs, type AppContext } from './types';
import { validateSettingsKeys } from './validate-settings-keys';

export function updateWithPresets(config: AppConfigs, context: AppContext) {
    if (!config.presets) {
        return config;
    }

    const presetsConfigPath = getPresetsConfigPath(config, context.cwd);
    const presetsOverridesPath = tryResolve(`${config.presets}/arui-scripts.overrides`, {
        paths: [context.cwd],
    });

    if (presetsConfigPath) {
        let presetsSettings = loadConfigFile(presetsConfigPath);

        // eslint-disable-next-line no-underscore-dangle
        if (presetsSettings.__esModule) {
            // ES-модули возвращаются с default export в обёртке.
            presetsSettings = presetsSettings.default;
        }
        validateSettingsKeys(config, presetsSettings, presetsConfigPath);
        // eslint-disable-next-line no-param-reassign
        config = merge(config, presetsSettings);
    }
    if (presetsOverridesPath) {
        context.overridesPath.unshift(presetsOverridesPath);
    }

    return config;
}

export function getPresetsConfigPath(config: AppConfigs, cwd: string) {
    return tryResolve(`${config.presets}/arui-scripts.config`, {
        paths: [cwd],
    });
}
