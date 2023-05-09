import { PackageSettings } from 'arui-scripts';

const aruiScriptsConfig: PackageSettings = {
    presets: "./presets",
    clientPolyfillsEntry: "./src/polyfills.js",
    serverEntry: "./src/server",
    clientEntry: "./src/client",
    keepCssVars: false,
    debug: true,
    applicationModules: [
        {
            name: 'widget-a',
            entry: './src/widget-a',
        }
    ]
}

export default aruiScriptsConfig;
