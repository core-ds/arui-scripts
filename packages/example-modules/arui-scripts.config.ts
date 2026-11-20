import { type PackageSettings } from 'arui-scripts';
import { createSharedGroup } from 'arui-scripts/helpers';

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
        exposes: {
            ModuleCompat: {
                entry: './src/modules/module-compat/index',
            },
            FactoryModuleCompat: {
                entry: './src/modules/factory-module-compat/index',
            },
            ServerStateModuleCompat: {
                entry: './src/modules/server-state-module-compat/index',
                externals: {
                    react: 'react',
                    'react-dom': 'reactDOM',
                },
            },
            ModuleAbstractCompat: {
                entry: './src/modules/module-abstract/index',
            },
        },
    },
    modules: {
        shared: createSharedGroup({
            packageJson: require.resolve('./package.json'),
            runtime: ['react', 'react-dom'],
            libraries: {
                '@alfalab/core-components/': { requiredVersion: '^42.1.0' },
            },
            eager: false,
        }),
        exposes: {
            Module: './src/modules/module/index',
            ServerStateFactoryModule: './src/modules/server-state-factory-module/index',
            ServerStateModule: './src/modules/server-state-module/index',
            ModuleAbstract: './src/modules/module-abstract/index',
        },
        options: {
            cssPrefix: '.my-prefix',
            useSeparateBuild: true,
        },
    },
    dictionaryCompression: {
        dictionaryPath: ['./dict/example-modules.dict'],
    },
};

export default aruiScriptsConfig;
