import { PackageSettings } from 'arui-scripts';

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
            'react': 'react',
            'react-dom': 'reactDOM',
        }
    },
    modules: {
        shared: {
            'react': {
                eager: true,
                requiredVersion: '^17.0.0',
            },
            'react-dom': {
                eager: true,
                requiredVersion: '^17.0.0',
            }
        }
    }
}

export default aruiScriptsConfig;
