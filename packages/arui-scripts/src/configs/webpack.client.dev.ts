import applyOverrides from './util/apply-overrides';
import { createClientWebpackConfig, createSingleClientWebpackConfig } from './webpack.client';

const config = applyOverrides(
    ['webpack', 'webpackClient', 'webpackDev', 'webpackClientDev'],
    createClientWebpackConfig('dev'),
    { createSingleClientWebpackConfig: createSingleClientWebpackConfig.bind(null, 'dev') },
);

export default config;
