import path from 'path';

import config from './app-configs';

/**
 * Функция для создания конфигурационного файла postcss
 * @param {String[]} plugins список плагинов
 * @param {Object} options коллекция конфигураций плагинов, где ключ - название плагина, а значение - аргумент для инициализации
 * @returns {*}
 */
export function createPostcssConfig(plugins: string[], options: Record<string, unknown>) {
    return plugins.map(pluginName => {
        if (pluginName in options) {
            return [pluginName, options[pluginName]];
        }

        return pluginName
    });
}

export const postcssPlugins = [
    'postcss-omit-import-tilde',
    'postcss-import',
    'postcss-url',
    'postcss-mixins',
    'postcss-for',
    'postcss-each',
    'postcss-custom-media',
    config.keepCssVars === false && 'postcss-custom-properties',
    'postcss-strip-units',
    'postcss-calc',
    'postcss-color-function',
    'postcss-color-mod-function',
    'postcss-nested',
    'autoprefixer',
    'postcss-inherit',
    'postcss-discard-comments',
    // '@csstools/postcss-global-data'
].filter(Boolean) as string[];

export const postcssPluginsOptions = {
    'postcss-import': {
        path: ['./src'],
    },
    'postcss-url': {
        url: 'rebase',
    },
    'postcss-color-mod-function': {
        unresolved: 'warn',
    },
    // '@csstools/postcss-global-data': {
    //     files: [path.resolve(__dirname, 'mq.js')],
    // },
    ...(config.keepCssVars === false && {
        'postcss-custom-properties': {
            preserve: false,
            // importFrom: config.componentsTheme,
        }
    }),
};
