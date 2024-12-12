import applyOverrides from './util/apply-overrides';
import configs from './app-configs';

export const babelDependencies = applyOverrides('babelDependencies', {
    sourceType: 'unambiguous',
    presets: [
        [
            require.resolve('@babel/preset-env'),
            {
                // Allow importing core-js in entrypoint and use browserlist to select polyfills
                useBuiltIns: 'entry',
                // Set the corejs version we are using to avoid warnings in console
                // This will need to change once we upgrade to corejs@3
                corejs: '3.32',
                // Exclude transforms that make all code slower
                exclude: ['transform-typeof-symbol'],
            },
        ],
    ],
    plugins: [
        [
            require.resolve('@babel/plugin-transform-runtime'),
            {
                corejs: false,
                helpers: true,
                // By default, babel assumes babel/runtime version 7.0.0-beta.0,
                // explicitly resolving to match the provided helper functions.
                // https://github.com/babel/babel/issues/10261
                version: configs.babelRuntimeVersion,
                regenerator: true,
            },
        ],
    ],
});
