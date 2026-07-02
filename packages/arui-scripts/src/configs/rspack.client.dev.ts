import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createFindPluginFunction } from './util/find-plugin';
import { createClientWebpackConfig, createSingleClientWebpackConfig } from './rspack.client';

export const config = applyOverrides(
    ['rspack', 'rspackClient', 'rspackDev', 'rspackClientDev'],
    createClientWebpackConfig('dev'),
    {
        createSingleClientWebpackConfig: createSingleClientWebpackConfig.bind(null, 'dev'),
        findLoader,
        findPlugin: createFindPluginFunction<'client'>(),
    },
);
