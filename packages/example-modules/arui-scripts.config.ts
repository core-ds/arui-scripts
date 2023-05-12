import { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    presets: "./presets",
    serverPort: 3001,
    clientServerPort: 8081,
    clientPolyfillsEntry: null,
    serverEntry: "./src/server/index",
    clientEntry: "./src/client",
    keepCssVars: false,
    debug: true,
    applicationModules: [
        {
            name: 'ClientWidgetLegacy',
            entry: './src/widgets/client-widget-legacy/index',
        },
        {
            name: 'ServerWidgetLegacy',
            entry: './src/widgets/server-widget-legacy/index',
        }
    ],
    mfModules: {
        shared: {
            'react': '^17.0.0',
            'react-dom': '^17.0.0',
        },
        exposes: {
            'ClientWidgetMF': './src/widgets/client-widget-mf/index',
            'ServerWidgetMF': './src/widgets/server-widget-mf/index',
        }
    }
}

export default aruiScriptsConfig;
