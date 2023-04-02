import applyOverrides from './util/apply-overrides';
import { createServerConfig } from './webpack.server';

const config = applyOverrides(
    ['webpack', 'webpackServer', 'webpackDev', 'webpackServerDev'],
    createServerConfig('dev'),
);

export default config;
