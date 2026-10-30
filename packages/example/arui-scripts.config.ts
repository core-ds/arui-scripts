import { type PackageSettings } from 'arui-scripts';
import { createSharedGroup } from 'arui-scripts/helpers';

const aruiScriptsConfig: PackageSettings = {
    presets: './presets',
    clientPolyfillsEntry: './src/polyfills.js',
    serverEntry: './src/server/index',
    clientEntry: './src/client',
    componentsTheme: '../../node_modules/@alfalab/core-components/themes/corp.css',
    keepCssVars: false,
    debug: true,
    codeLoader: 'swc',
    jestCodeTransformer: 'swc',
    compatModules: {
        shared: {
            react: 'react',
            'react-dom': 'reactDOM',
        },
    },
    modules: {
        shared: createSharedGroup({
            packageJson: require.resolve('./package.json'),
            runtime: ['react', 'react-dom'],
            libraries: {
                '@alfalab/core-components/': { requiredVersion: '42.2.1' },
            },
            eager: true,
        }),
    },
    experimentalReactCompiler: {
        target: '18',
    },
};

export default aruiScriptsConfig;
