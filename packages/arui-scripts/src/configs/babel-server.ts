import applyOverrides from './util/apply-overrides';
import configs from './app-configs';

const config = applyOverrides(['babel', 'babelServer'], {
    presets: [
        [
            require.resolve('@babel/preset-env'),
            { modules: false, targets: { node: 'current' }, loose: true },
        ],
        configs.tsconfig !== null &&
            !configs.useTscLoader &&
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
        [require.resolve('@babel/plugin-transform-runtime'), { helpers: false }],
        require.resolve('@babel/plugin-transform-nullish-coalescing-operator'),
        require.resolve('@babel/plugin-transform-optional-chaining'),
        configs.collectCoverage && require.resolve('babel-plugin-istanbul'),
    ].filter(Boolean),
    env: {
        production: {
            plugins: [
                require.resolve('@babel/plugin-transform-react-constant-elements'),
                require.resolve('@babel/plugin-transform-react-inline-elements'),
                require.resolve('babel-plugin-transform-react-remove-prop-types'),
            ],
        },
        test: {
            plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
        },
    },
});

export default config;
