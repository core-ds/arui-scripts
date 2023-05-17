import { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    presets: "./presets",
    serverPort: 3001,
    clientServerPort: 8081,
    devServerCors: true,
    clientPolyfillsEntry: null,
    serverEntry: "./src/server/index",
    clientEntry: "./src/client",
    keepCssVars: false,
    debug: true,
    embeddedModules: {
        shared: {
            react: 'react',
            'react-dom': 'reactDOM',
        },
        exposes: {
            'ClientModuleEmbedded': {
                entry: './src/modules/client-module-embedded/index',
            },
            'ServerModuleEmbedded': {
                entry: './src/modules/server-module-embedded/index',
                embeddedConfig: {
                    react: 'react',
                    'react-dom': 'reactDOM',
                }
            }
        }
    },
    mfModules: {
        shared: {
            'react': '^17.0.0',
            'react-dom': '^17.0.0',
        },
        exposes: {
            'ClientModuleMF': './src/modules/client-module-mf/index',
            'ServerModuleMF': './src/modules/server-module-mf/index',
        }
    }
}

export default aruiScriptsConfig;
