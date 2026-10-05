import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createFindPluginFunction } from './util/find-plugin';
import { createServerConfig } from './rspack.server';

export const rspackServerConfig = applyOverrides(
    ['rspack', 'rspackServer', 'rspackProd', 'rspackServerProd'],
    createServerConfig('prod'),
    { findLoader, findPlugin: createFindPluginFunction<'server'>() },
);
