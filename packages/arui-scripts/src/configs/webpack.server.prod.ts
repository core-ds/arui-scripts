import applyOverrides from './util/apply-overrides';
import { createServerConfig } from './webpack.server';

const config = applyOverrides(
    ['webpack', 'webpackServer', 'webpackProd', 'webpackServerProd'],
    createServerConfig('prod'),
);

export default config;
