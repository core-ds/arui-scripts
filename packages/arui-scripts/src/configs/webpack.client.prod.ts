import applyOverrides from './util/apply-overrides';
import { createClientWebpackConfig } from './webpack.client';

const config = applyOverrides(
    ['webpack', 'webpackClient', 'webpackProd', 'webpackClientProd'],
    createClientWebpackConfig('prod'),
);

export default config;
