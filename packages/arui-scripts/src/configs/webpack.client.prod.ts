import applyOverrides from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createClientWebpackConfig, createSingleClientWebpackConfig } from './webpack.client';

const config = applyOverrides(
    ['webpack', 'webpackClient', 'webpackProd', 'webpackClientProd'],
    createClientWebpackConfig('prod'),
    {
        createSingleClientWebpackConfig: createSingleClientWebpackConfig.bind(null, 'prod'),
        findLoader,
    },
);

export default config;
