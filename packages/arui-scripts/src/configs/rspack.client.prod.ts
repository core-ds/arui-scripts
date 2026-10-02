import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createFindPluginFunction } from './util/find-plugin';
import { createClientRspackConfig, createSingleClientRspackConfig } from './rspack.client';

export const rspackClientConfig = applyOverrides(
    ['rspack', 'rspackClient', 'rspackProd', 'rspackClientProd'],
    createClientRspackConfig('prod'),
    {
        createSingleClientRspackConfig: createSingleClientRspackConfig.bind(null, 'prod'),
        findLoader,
        findPlugin: createFindPluginFunction<'client'>(),
    },
);
