import applyOverrides from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createClientWebpackConfig, createSingleClientWebpackConfig } from './webpack.client';

const config = applyOverrides(
    ['webpack', 'webpackClient', 'webpackDev', 'webpackClientDev'],
    createClientWebpackConfig('dev'),
    { 
        createSingleClientWebpackConfig: createSingleClientWebpackConfig.bind(null, 'dev'),
        findLoader,
    },
);

export default config;
