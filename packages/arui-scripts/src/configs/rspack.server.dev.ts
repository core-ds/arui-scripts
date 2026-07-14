import { applyOverrides } from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createFindPluginFunction } from './util/find-plugin';
import { createServerConfig } from './rspack.server';

export const webpackServerConfig = applyOverrides(
    ['rspack', 'rspackServer', 'rspackDev', 'rspackServerDev'],
    createServerConfig('dev'),
    { findLoader, findPlugin: createFindPluginFunction<'server'>() },
);
