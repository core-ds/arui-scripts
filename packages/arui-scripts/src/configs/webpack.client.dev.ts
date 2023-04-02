import applyOverrides from './util/apply-overrides';
import { createClientWebpackConfig } from './webpack.client';

const config = applyOverrides(
    ['webpack', 'webpackClient', 'webpackDev', 'webpackClientDev'],
    createClientWebpackConfig('dev'),
);

export default config;
