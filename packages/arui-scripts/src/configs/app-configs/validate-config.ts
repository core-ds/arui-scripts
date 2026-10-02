import { type AppContextWithConfigs } from './types';
import { validateBuildSizeBudgets } from './validate-build-size-budgets';

export function validateConfig(config: AppContextWithConfigs) {
    validateBuildSizeBudgets(config.buildSizeBudgets);

    if (config.experimentalReactCompiler !== 'disabled' && config.codeLoader !== 'swc') {
        throw new Error(
            'Использование `experimentalReactCompiler` на данный момент поддерживается только с `codeLoader: "swc"`. \nЛибо выключите `experimentalReactCompiler`, либо измените настройку для `codeLoader`.',
        );
    }
}
