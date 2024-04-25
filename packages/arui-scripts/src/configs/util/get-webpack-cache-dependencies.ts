import configs from '../app-configs';
import { getConfigFilePath } from '../app-configs/read-config-file';
import { getPresetsConfigPath } from '../app-configs/update-with-presets';

export function getWebpackCacheDependencies(): Record<string, string[]> {
    return {
        overrides: configs.overridesPath,
        appConfigs: [
            getConfigFilePath(configs.cwd),
            getPresetsConfigPath(configs, configs.cwd),
        ].filter(Boolean) as string[],
    }
}
