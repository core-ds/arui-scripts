import applyOverrides from './util/apply-overrides';
import { findLoader } from './util/find-loader';
import { createServerConfig } from './webpack.server';

const config = applyOverrides(
    ['webpack', 'webpackServer', 'webpackDev', 'webpackServerDev'],
    createServerConfig('dev'),
    { findLoader },
);

export default config;
