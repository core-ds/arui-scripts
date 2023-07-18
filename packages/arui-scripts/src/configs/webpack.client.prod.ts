import applyOverrides from './util/apply-overrides';
import { createClientWebpackConfig, createSingleClientWebpackConfig } from './webpack.client';

const config = applyOverrides(
    ['webpack', 'webpackClient', 'webpackProd', 'webpackClientProd'],
    createClientWebpackConfig('prod'),
    { createSingleClientWebpackConfig: createSingleClientWebpackConfig.bind(null, 'prod') }
);

export default config;
