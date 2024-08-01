// TODO: remove eslint-disable and eslint-disable-next-line
/* eslint-disable no-param-reassign */
import { OverrideFile } from 'arui-scripts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { RuleSetRule } from 'webpack';

const overrides: OverrideFile = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    webpackClient: (config, appConfig, { findLoader }) => {
        const allConfigs = Array.isArray(config) ? config : [config];

        // Делаем стабильные имена классов css модулей для тестирования
        // eslint-disable-next-line no-restricted-syntax
        for (const config of allConfigs) {
            const cssModulesLoader = findLoader(config, '/\\.module\\.css$/');

            if (cssModulesLoader?.use && Array.isArray(cssModulesLoader.use)) {
                const cssLoader = cssModulesLoader.use.find((loader) => {
                    // без длинной проверки ts ругается
                    if (loader && typeof loader === 'object' && ('loader' in loader) && typeof loader.loader === 'string') {
                        return loader.loader.includes('css-loader') && !loader.loader.includes('postcss-loader')
                    }

                    return false
                }) as RuleSetRule;

                if (typeof cssLoader?.options === 'object') {
                    cssLoader.options.modules = {
                        localIdentName: '[name]-[local]-[hash:base64:5]'
                    }
                }
            }
        }

        return allConfigs;
    },
    webpackClientProd: (config) => {
        const allConfigs = Array.isArray(config) ? config : [config];

        return allConfigs.map((config) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            config.optimization.minimize = false;

            return config;
        });
    },
    postcss: (config, appConfig, { createPostcssConfig, postcssPluginsOptions, postcssPlugins }) => {
        const options = {
            ...postcssPluginsOptions,
            'postcss-mixins': {
                mixinsFiles: [path.join(process.cwd(), '../../node_modules/@alfalab/core-components/vars/typography.css')],
            },
        };

        return createPostcssConfig(postcssPlugins, options);
    }
};

export default overrides;
