// TODO: remove eslint-disable and eslint-disable-next-line
/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
import { type RuleSetRule } from '@rspack/core';
import { type OverrideFile } from 'arui-scripts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import path from 'node:path';

const overrides: OverrideFile = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    rspackClient: (config, appConfig, { findLoader }) => {
        const allConfigs = Array.isArray(config) ? config : [config];

        // Делаем стабильные имена классов css модулей для тестирования
        // eslint-disable-next-line no-restricted-syntax
        for (const singleConfig of allConfigs) {
            const cssModulesLoader = findLoader(singleConfig, '/\\.module\\.css$/');

            if (cssModulesLoader?.use && Array.isArray(cssModulesLoader.use)) {
                const cssLoader = cssModulesLoader.use.find((loader) => {
                    // без длинной проверки ts ругается
                    if (
                        loader &&
                        typeof loader === 'object' &&
                        'loader' in loader &&
                        typeof loader.loader === 'string'
                    ) {
                        return (
                            loader.loader.includes('css-loader') &&
                            !loader.loader.includes('postcss-loader')
                        );
                    }

                    return false;
                }) as RuleSetRule;

                if (typeof cssLoader?.options === 'object') {
                    cssLoader.options.modules = {
                        localIdentName: '[name]-[local]-[hash:base64:5]',
                    };
                }
            }
        }

        return allConfigs;
    },
    rspackClientProd: (config) => {
        const allConfigs = Array.isArray(config) ? config : [config];

        return allConfigs.map((singleConfig) => {
            singleConfig.optimization.minimize = false;

            return singleConfig;
        });
    },
    postcss: (config) => {
        const overridesConfig = config.map((name) => {
            if (name !== 'postcss-mixins') return name;

            return [
                name,
                {
                    mixinsFiles: [
                        path.join(
                            process.cwd(),
                            '../../node_modules/@alfalab/core-components/vars/typography.css',
                        ),
                    ],
                },
            ];
        });

        return overridesConfig;
    },
};

export default overrides;
