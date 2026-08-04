import { type AppContextWithConfigs, DEVTOOLS_MODES } from './types';

export function validateConfig(config: AppContextWithConfigs) {
    if (config.experimentalReactCompiler !== 'disabled' && config.codeLoader !== 'swc') {
        throw new Error(
            'Использование `experimentalReactCompiler` на данный момент поддерживается только с `codeLoader: "swc"`. \nЛибо выключите `experimentalReactCompiler`, либо измените настройку для `codeLoader`.',
        );
    }

    if (!DEVTOOLS_MODES.includes(config.devtools)) {
        throw new Error(
            `Некорректное значение настройки \`devtools\`: ${JSON.stringify(
                config.devtools,
            )}. Допустимые значения: ${DEVTOOLS_MODES.map((mode) => `"${mode}"`).join(', ')}.`,
        );
    }
}
