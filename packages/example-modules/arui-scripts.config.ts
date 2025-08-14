import { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    presets: './presets',
    serverPort: 3001,
    clientServerPort: 8082,
    devServerCors: true,
    clientPolyfillsEntry: null,
    serverEntry: './src/server/index',
    clientEntry: './src/client',
    componentsTheme: '../../node_modules/@alfalab/core-components/themes/corp.css',
    keepCssVars: false,
    codeLoader: 'swc',
    jestCodeTransformer: 'swc',
    debug: true,
    compatModules: {
        shared: {
            react: 'react',
            'react-dom': 'reactDOM',
        },
        exposes: {
            'ModuleCompat': {
                entry: './src/modules/module-compat/index',
            },
            'FactoryModuleCompat': {
                entry: './src/modules/factory-module-compat/index',
            },
            'ServerStateModuleCompat': {
                entry: './src/modules/server-state-module-compat/index',
                externals: {
                    react: 'react',
                    'react-dom': 'reactDOM',
                }
            },
            'ModuleAbstractCompat': {
                entry: './src/modules/module-abstract/index',
            }
        }
    },
    modules: {
        shared: {
            'react': '^17.0.0',
            'react-dom': '^17.0.0',
        },
        exposes: {
            'Module': './src/modules/module/index',
            'ServerStateFactoryModule': './src/modules/server-state-factory-module/index',
            'ServerStateModule': './src/modules/server-state-module/index',
            'ModuleAbstract': './src/modules/module-abstract/index',
        }
    },
    // TODO: enable it, currently it randomly hangs
    // dictionaryCompression: {
    //     dictionaryPath: [
    //         './dict/example-modules.dict'
    //     ]
    // }
}

export default aruiScriptsConfig;
