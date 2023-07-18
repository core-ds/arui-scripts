import { AppConfigs, AppContext } from './types';
import { tryResolve } from '../util/resolve';
import { validateSettingsKeys } from './validate-settings-keys';

export function updateWithPresets(config: AppConfigs, context: AppContext) {
    if (!config.presets) {
        return config;
    }

    const presetsConfigPath = tryResolve(
        `${config.presets}/arui-scripts.config`,
        { paths: [context.cwd] }
    );
    const presetsOverridesPath = tryResolve(
        `${config.presets}/arui-scripts.overrides`,
        { paths: [context.cwd] }
    );
    if (presetsConfigPath) {
        let presetsSettings = require(presetsConfigPath);
        if (presetsSettings.__esModule) {
            // ts-node импортирует esModules, из них надо вытягивать default именно так
            presetsSettings = presetsSettings.default;
        }
        validateSettingsKeys(config, presetsSettings, presetsConfigPath);
        config = {
            ...config,
            ...presetsSettings,
        }
    }
    if (presetsOverridesPath) {
        context.overridesPath.unshift(presetsOverridesPath);
    }

    return config;
}
