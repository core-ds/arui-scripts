import { cacheDirectory, cacheSettings } from '../cache/settings';

import { type AppContextWithConfigs } from './types';

export function validateConfig(config: AppContextWithConfigs) {
    if (cacheSettings(config)) cacheDirectory(config);
    if (config.experimentalReactCompiler !== 'disabled' && config.codeLoader !== 'swc') {
        throw new Error(
            'Использование `experimentalReactCompiler` на данный момент поддерживается только с `codeLoader: "swc"`. \nЛибо выключите `experimentalReactCompiler`, либо измените настройку для `codeLoader`.',
        );
    }
}
