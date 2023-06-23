const fs = require('fs');
const { pathsToModuleNameMapper } = require('ts-jest');
const { parseConfigFileTextToJson } = require('typescript');
const merge = require('lodash.merge');
const configs = require('../app-configs').default;
const tsConfigPath = configs.tsconfig;
const tsConfigText = fs.readFileSync(configs.tsconfig, 'utf8');
const tsConfig = parseConfigFileTextToJson(tsConfigPath, tsConfigText);
const tsConfigPaths = tsConfig.config.compilerOptions.paths || {};

const defaultJestConfig = {
    testRegex: '(^.*src).*(((\/__test__\/|\/__tests__\/).*)|(test|spec|tests))\.(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}'
    ],
    // transform project js and ts files using babel ant ts transformers
    transform: {
        '^.+\\.jsx?$': require.resolve('./babel-transform'),
        '^.+\\.tsx?$': require.resolve('ts-jest'),
        // transform other files to simple empty strings
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': require.resolve('./file-transform')
    },
    moduleNameMapper: {
        // replace all css files with simple empty exports
        '\\.css$': require.resolve('./css-mock'),
        ...pathsToModuleNameMapper(tsConfigPaths, { prefix: '<rootDir>/' })
    },
    snapshotSerializers: [
        require.resolve('jest-snapshot-serializer-class-name-to-string')
    ],
    globals: {
        'ts-jest': {
            tsconfig: configs.tsconfig,
            babelConfig: require('../babel-client').default
        }
    }
};

let appJestConfig = {};
if (configs.appPackage.jest) {
    appJestConfig = configs.appPackage.jest;
    if (appJestConfig.preset) { // we don't need presets when using presets
        if (appJestConfig.preset !== 'arui-scripts') {
            console.warn('arui-scripts test command doesn\'t support jest preset config');
        }
        delete appJestConfig.preset;
    }
}

module.exports = merge(defaultJestConfig, appJestConfig);
