import path from 'path';

import type { Plugin, PluginCreator, Processor } from 'postcss';

import { postCssGlobalVariables } from '../plugins/postcss-global-variables/postcss-global-variables';

import config from './app-configs';
import supportingBrowsers from './supporting-browsers';

type PostCssPluginName = string | PluginCreator<any>;
type PostcssPlugin = string | [string, unknown] | (() => Plugin | Processor);

/**
 * Функция для создания конфигурационного файла postcss
 * @param {PostCssPluginName[]} plugins список плагинов
 * @param {Object} options коллекция конфигураций плагинов, где ключ - название плагина, а значение - аргумент для инициализации
 * @returns {*}
 */
export function createPostcssConfig(
    plugins: PostCssPluginName[],
    options: Record<string, unknown>,
): PostcssPlugin[] {
    return plugins.map((pluginName) => {
        if (typeof pluginName === 'string') {
            return pluginName in options
                ? [pluginName, options[pluginName]]
                : pluginName;
        }

        return () => pluginName(options[pluginName.name]);
    });
}

export const postcssPlugins = [
    'postcss-omit-import-tilde',
    'postcss-import',
    'postcss-url',
    'postcss-mixins',
    'postcss-for',
    'postcss-each',
    postCssGlobalVariables,
    'postcss-custom-media',
    'postcss-color-mod-function',
    !config.keepCssVars && 'postcss-custom-properties',
    !config.keepCssVars && 'postcss-remove-root',
    'postcss-strip-units',
    'postcss-calc',
    'postcss-color-function',
    'postcss-nested',
    'autoprefixer',
    'postcss-inherit',
    'postcss-discard-comments',
].filter(Boolean) as PostCssPluginName[];

export const postcssPluginsOptions = {
    'postcss-import': {
        path: ['./src'],
    },
    'postCssGlobalVariables': {
        files: [path.join(__dirname, 'mq.css'), config.componentsTheme].filter(Boolean) as string[],
    },
    'postcss-url': {
        url: 'rebase',
    },
    'postcss-color-mod-function': {
        unresolved: 'warn',
    },
    'postcss-custom-properties': {
        preserve: false,
    },
    autoprefixer: {
        overrideBrowserslist: supportingBrowsers,
    },
};
