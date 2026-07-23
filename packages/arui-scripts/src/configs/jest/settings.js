/* eslint-disable @typescript-eslint/no-var-requires */
// Мы используем эти настройки сразу в двух местах - в jest-presets и в настройках jest-а, которые мы загружаем в самих скриптах
// jest-presets могут использоваться внешними утилитами, которые используют разработчики, настройки в скриптах
// используются при запуске `arui-scripts test`. Посколько в jest жестко зафиксировано где именно должен лежать файл с пресетами
// нам приходится отвязывать его от основного кода скриптов
const fs = require('fs');
const { pathsToModuleNameMapper } = require('ts-jest');
const { parseConfigFileTextToJson } = require('typescript');
const { swcJestConfig } = require('../swc');

const { configs } = require('../app-configs');

// Значения по умолчанию из самого jest, см. https://jestjs.io/docs/configuration#transformignorepatterns-arraystring
const PNP_TRANSFORM_IGNORE_PATTERN = '\\.pnp\\.[^\\\\/]+$';
const DEFAULT_TRANSFORM_IGNORE_PATTERNS = ['/node_modules/', PNP_TRANSFORM_IGNORE_PATTERN];

module.exports = {
    testRegex: 'src/.*(((/__test__/|/__tests__/).*)|(test|spec|tests)).(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    testEnvironmentOptions: {
        url: 'http://localhost',
    },
    transform: {
        '^.+\\.jsx?$': getJsTransformer(),
        '^.+\\.mjs$': getJsTransformer(),
        '^.+\\.tsx?$': getTsTransformer(),
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': require.resolve('./file-transform'),
    },
    transformIgnorePatterns: getTransformIgnorePatterns(),
    moduleNameMapper: {
        // replace all css files with simple empty exports
        '\\.css$': require.resolve('./css-mock'),
        ...pathsToModuleNameMapper(getPathMapping(), { prefix: '<rootDir>/' }),
    },
    snapshotSerializers: [require.resolve('jest-snapshot-serializer-class-name-to-string')],
    globals: {
        'ts-jest': {
            tsconfig: configs.tsconfig,
        },
    },
};

function getPathMapping() {
    if (!configs.tsconfig) {
        return {};
    }

    const tsConfigText = fs.readFileSync(configs.tsconfig, 'utf8');
    const tsConfig = parseConfigFileTextToJson(configs.tsconfig, tsConfigText);

    return tsConfig.config.compilerOptions?.paths || {};
}

function getTsTransformer() {
    if (configs.jestCodeTransformer === 'tsc') {
        return require.resolve('ts-jest');
    }

    if (configs.jestCodeTransformer === 'swc') {
        return [require.resolve('@swc/jest'), swcJestConfig];
    }

    return require.resolve('./babel-transform');
}

function getJsTransformer() {
    if (configs.jestCodeTransformer === 'swc') {
        return [require.resolve('@swc/jest'), swcJestConfig];
    }

    return require.resolve('./babel-transform');
}

function getTransformIgnorePatterns() {
    const packages = configs.jestTransformNodeModules;

    if (!packages || packages.length === 0) {
        return DEFAULT_TRANSFORM_IGNORE_PATTERNS;
    }

    const list = packages.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

    // Игнорируем всё в node_modules, кроме путей, содержащих /node_modules/<пакет>/.
    // Вхождение ищется в любом месте пути, чтобы работали вложенные установки
    // вида node_modules/foo/node_modules/uuid.
    return [
        `^(?!.*[\\\\/]node_modules[\\\\/](?:${list})[\\\\/]).*[\\\\/]node_modules[\\\\/]`,
        PNP_TRANSFORM_IGNORE_PATTERN,
    ];
}
