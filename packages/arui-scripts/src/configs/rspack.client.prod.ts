import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createFindPluginFunction } from './util/find-plugin';
import { finalizePersistentCache } from './persistent-cache';
import { createClientWebpackConfig, createSingleClientWebpackConfig } from './rspack.client';

export const webpackClientConfig = finalizePersistentCache(
    applyOverrides(
        ['rspack', 'rspackClient', 'rspackProd', 'rspackClientProd'],
        createClientWebpackConfig('prod'),
        {
            createSingleClientWebpackConfig: createSingleClientWebpackConfig.bind(null, 'prod'),
            findLoader,
            findPlugin: createFindPluginFunction<'client'>(),
        },
    ),
);
