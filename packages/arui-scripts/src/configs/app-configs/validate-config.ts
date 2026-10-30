import { getProjectTypeScript } from '../util/typescript';

import { type AppContextWithConfigs } from './types';
import { validateBuildSizeBudgets } from './validate-build-size-budgets';

export function validateConfig(config: AppContextWithConfigs) {
    validateBuildSizeBudgets(config.buildSizeBudgets);

    const tscSettings = (['codeLoader', 'jestCodeTransformer'] as const).filter(
        (key) => config[key] === 'tsc',
    );

    if (
        tscSettings.length > 0 &&
        Number.parseInt(getProjectTypeScript(config.cwd).version, 10) >= 7
    ) {
        throw new Error(
            `${tscSettings.join(
                ', ',
            )}: режим "tsc" deprecated и поддерживается только с TypeScript <7. Используйте "swc" или "babel".`,
        );
    }

    if (config.experimentalReactCompiler !== 'disabled' && config.codeLoader !== 'swc') {
        throw new Error(
            'Использование `experimentalReactCompiler` на данный момент поддерживается только с `codeLoader: "swc"`. \nЛибо выключите `experimentalReactCompiler`, либо измените настройку для `codeLoader`.',
        );
    }
}
