// TODO: remove eslint-disable-next-line
import { OverrideFile } from 'arui-scripts';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import {RuleSetRule} from 'webpack';

const overrides: OverrideFile = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    webpackClient: (config, appConfig, { createSingleClientWebpackConfig, findLoader }) => {
        const workerConfig = createSingleClientWebpackConfig(
            { worker: './src/worker.ts' },
            'worker',
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        workerConfig.output.filename = 'worker.js';

        const rootConfigList = Array.isArray(config) ? config : [config];

        // Делаем стабильные имена классов css модулей для тестирования
        // eslint-disable-next-line no-restricted-syntax
        for (const rootConfig of rootConfigList) {
            const cssModulesLoader = findLoader(rootConfig, '/\\.module\\.css$/');

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

        return [
            ...rootConfigList,
            workerConfig,
        ];
    },
    webpackClientProd: (config) => {
        const allConfigs = Array.isArray(config) ? config : [config];

        return allConfigs.map((config) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            config.optimization.minimize = false;

            return config;
        });
    },
    postcss: (config) => {
        const overridesConfig = config
        .map(name => {
            if (name !== 'postcss-mixins') return name;

            return [
                name,
                {
                    mixinsFiles: [path.join(process.cwd(), '../../node_modules/@alfalab/core-components/vars/typography.css')]
                }
            ]
        })

        return overridesConfig;
    },
    html: template => template.replace('<head>', '<head><base href="/" />'),
};

export default overrides;
