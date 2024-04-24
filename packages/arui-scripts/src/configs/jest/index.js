// TODO: remove eslint-disable
/* eslint-disable @typescript-eslint/no-var-requires */
const merge = require('lodash.merge');
const configs = require('../app-configs').default;
const aruiJestPresets = require('./settings');

const defaultJestConfig = aruiJestPresets;

let appJestConfig = {};

if (configs.appPackage.jest) {
    appJestConfig = configs.appPackage.jest;
    if (appJestConfig.preset) {
        // we don't need presets when using presets
        if (appJestConfig.preset !== 'arui-scripts') {
            console.warn("arui-scripts test command doesn't support jest preset config");
        }
        delete appJestConfig.preset;
    }
}

module.exports = merge(defaultJestConfig, appJestConfig);
