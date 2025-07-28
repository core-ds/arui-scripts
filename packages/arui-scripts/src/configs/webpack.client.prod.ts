import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { findPlugin } from './util/find-plugin';
import { createClientWebpackConfig, createSingleClientWebpackConfig } from './webpack.client';

export const webpackClientConfig = applyOverrides(
    ['webpack', 'webpackClient', 'webpackProd', 'webpackClientProd'],
    createClientWebpackConfig('prod'),
    {
        createSingleClientWebpackConfig: createSingleClientWebpackConfig.bind(null, 'prod'),
        findLoader,
        findPlugin: findPlugin<'client'>(),
    },
);
