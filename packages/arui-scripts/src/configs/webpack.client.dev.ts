import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { findPlugin } from './util/find-plugin';
import { createClientWebpackConfig, createSingleClientWebpackConfig } from './webpack.client';

export const config = applyOverrides(
    ['webpack', 'webpackClient', 'webpackDev', 'webpackClientDev'],
    createClientWebpackConfig('dev'),
    {
        createSingleClientWebpackConfig: createSingleClientWebpackConfig.bind(null, 'dev'),
        findLoader,
        findPlugin: findPlugin<'client'>(),
    },
);
