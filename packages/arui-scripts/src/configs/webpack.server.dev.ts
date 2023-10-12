import applyOverrides from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { findPlugin } from './util/find-plugin';
import { createServerConfig } from './webpack.server';

const config = applyOverrides(
    ['webpack', 'webpackServer', 'webpackDev', 'webpackServerDev'],
    createServerConfig('dev'),
    { findLoader, findPlugin: findPlugin<'server'>() },
);

export default config;
