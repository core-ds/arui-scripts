import path from 'path';

import { configs } from '../app-configs';

import { tryResolve } from './resolve';

const SWC_HELPERS_PACKAGE = '@swc/helpers';

/**
 * alias для `@swc/helpers` на случай, когда приложение не может зарезолвить пакет само.
 * При `jsc.externalHelpers` SWC импортирует хелперы из `@swc/helpers`, а rspack резолвит этот импорт
 * относительно исходного файла, то есть из node_modules приложения. Пакет стоит в зависимостях arui-scripts,
 * но без hoisting (pnpm, вложенные node_modules) из приложения он недоступен — тогда подставляем копию arui-scripts.
 */
export function getSwcHelpersAlias(): Record<string, string> {
    if (configs.codeLoader !== 'swc') {
        return {};
    }

    if (tryResolve(`${SWC_HELPERS_PACKAGE}/package.json`, { paths: [configs.cwd] })) {
        return {};
    }

    return {
        [SWC_HELPERS_PACKAGE]: path.dirname(require.resolve(`${SWC_HELPERS_PACKAGE}/package.json`)),
    };
}
