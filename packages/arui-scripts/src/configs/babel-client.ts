import applyOverrides from './util/apply-overrides';
import { configs } from './app-configs';
import browsers from './supporting-browsers';

const babelClientConfig = applyOverrides(['babel', 'babelClient'], {
    presets: [
        [
            require.resolve('@babel/preset-env'),
            {
                targets: browsers,
                loose: true,
                // Allow importing core-js in entrypoint and use browserlist to select polyfills
                useBuiltIns: 'entry',
                // Set the corejs version we are using to avoid warnings in console
                corejs: '3.32',
                // Exclude transforms that make all code slower
                exclude: ['transform-typeof-symbol'],
            },
        ],
        configs.tsconfig !== null &&
            configs.codeLoader !== 'tsc' &&
            require.resolve('@babel/preset-typescript'),
        require.resolve('@babel/preset-react'),
    ].filter(Boolean),
    plugins: [
        require.resolve('@babel/plugin-syntax-dynamic-import'),
        require.resolve('@babel/plugin-transform-proto-to-assign'),
        [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
        [require.resolve('@babel/plugin-transform-class-properties'), { loose: true }],
        [require.resolve('@babel/plugin-transform-private-methods'), { loose: true }],
        [require.resolve('@babel/plugin-transform-private-property-in-object'), { loose: true }],
        require.resolve('@babel/plugin-transform-numeric-separator'),
        require.resolve('@babel/plugin-proposal-export-default-from'),
        require.resolve('@babel/plugin-transform-export-namespace-from'),
        [require.resolve('@babel/plugin-transform-object-rest-spread'), { useBuiltIns: true }],
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
        require.resolve('@babel/plugin-transform-nullish-coalescing-operator'),
        require.resolve('@babel/plugin-transform-optional-chaining'),
        configs.collectCoverage && require.resolve('babel-plugin-istanbul'),
    ].filter(Boolean),
    env: {
        production: {
            plugins: [
                require.resolve('@babel/plugin-transform-react-constant-elements'),
                require.resolve('@babel/plugin-transform-react-inline-elements'),
                [
                    require.resolve('babel-plugin-transform-react-remove-prop-types'),
                    { removeImport: true },
                ],
            ],
        },
        test: {
            plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
        },
    },
});

export default babelClientConfig;
