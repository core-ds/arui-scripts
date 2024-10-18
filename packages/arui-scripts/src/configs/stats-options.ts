import type { RspackOptionsNormalized } from '@rspack/core';

import applyOverrides from './util/apply-overrides';

const statsOptions: RspackOptionsNormalized['stats'] = applyOverrides('stats', {
    // Add asset Information
    assets: false,
    // Add information about cached (not built) modules
    cached: false,
    // Show cached assets (setting this to `false` only shows emitted files)
    cachedAssets: false,
    // Add children information
    children: false,
    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: false,
    // Add built modules information to chunk information
    chunkModules: false,
    // Add the origins of chunks and chunk merging info
    chunkOrigins: false,
    // `webpack --colors` equivalent
    colors: true,
    // Add errors
    errors: true,
    // Add details to errors (like resolving log)
    errorDetails: true,
    // Add the hash of the compilation
    hash: false,
    // Add built modules information
    modules: true,
    // Show dependencies and origin of warnings/errors (since webpack 2.5.0)
    moduleTrace: true,
    // Show performance hint when file size exceeds `performance.maxAssetSize`
    performance: true,
    // Add public path information
    publicPath: false,
    // Add information about the reasons why modules are included
    reasons: false,
    // Add timing information
    timings: true,
    // Add webpack version information
    version: false,
    // Add warnings
    warnings: true,
    // ignore warning from missing types
    warningsFilter: /export .* was not found in/,
});

export default statsOptions;
