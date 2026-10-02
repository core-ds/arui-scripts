import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createFindPluginFunction } from './util/find-plugin';
import { createClientRspackConfig, createSingleClientRspackConfig } from './rspack.client';

export const config = applyOverrides(
    ['rspack', 'rspackClient', 'rspackDev', 'rspackClientDev'],
    createClientRspackConfig('dev'),
    {
        createSingleClientRspackConfig: createSingleClientRspackConfig.bind(null, 'dev'),
        findLoader,
        findPlugin: createFindPluginFunction<'client'>(),
    },
);
