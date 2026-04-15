import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createFindPluginFunction } from './util/find-plugin';
import { createServerConfig } from './webpack.server';

export const webpackServerConfig = applyOverrides(
    ['webpack', 'webpackServer', 'webpackProd', 'webpackServerProd'],
    createServerConfig('prod'),
    { findLoader, findPlugin: createFindPluginFunction<'server'>() },
);
