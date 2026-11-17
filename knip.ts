import baseConfig from 'arui-presets-lint/knip';

const workspaceConfig = {
    ...baseConfig,
    entry: [...baseConfig.entry, 'src/bin/index.ts', 'stylelint.config.{js,mjs}'],
};

export default {
    ...baseConfig,
    ignore: [
        ...baseConfig.ignore,
        '**/build/**',
        '**/.build/**',
        // тесты загружают эти конфиги по пути, генератор копирует Yarn как ресурс
        '**/__tests__/fixtures*/**',
        'packages/create-arui-scripts-app/assets/**',
    ],
    ignoreDependencies: [
        ...baseConfig.ignoreDependencies,
        // в Git-хуках npx должен выбирать Prettier 3, а не транзитивную версию 2
        'prettier',
        // утилита выпуска остается доступной для ручного запуска
        'conventional-changelog-cli',
        // плагины PostCSS загружаются по строковым именам из postcss.config.ts
        'autoprefixer',
        'postcss-omit-import-tilde',
        'postcss-import',
        'postcss-url',
        'postcss-mixins',
        'postcss-for',
        'postcss-each',
        'postcss-custom-media',
        'postcss-color-mod-function',
        'postcss-custom-properties',
        'postcss-remove-root',
        'postcss-strip-units',
        'postcss-calc',
        'postcss-color-function',
        'postcss-nested',
        'postcss-inherit',
        'postcss-discard-comments',
        // при сборке приложений Babel добавляет импорты core-js
        'core-js',
        // эти пакеты загружаются плагинами при сборке, без прямых импортов
        'imagemin',
        'react-compiler-runtime',
        // тесты резолвят версии из зависимостей Rspack и imagemin-svgo
        'rslog',
        'svgo',
        // загрузчики и минификаторы резолвятся в конфигурациях сборщика по имени
        'style-loader',
        'terser-webpack-plugin',
        'swc-plugin-coverage-instrument',
    ],
    ignoreIssues: {
        // инструменты сборки подтягивают Browserslist, source-map-support опционален
        'packages/arui-scripts/src/commands/util/load-browserslist.ts': ['unlisted'],
        'packages/arui-scripts/src/configs/util/install-sourcemap-support.js': ['unlisted'],
        // экспорты примера используются как входные данные для проверки сборщика
        'packages/example/src/utils.ts': ['exports'],
        'packages/arui-scripts-artifacts/src/utils/exec.ts': ['exports', 'duplicates'],
        'packages/example-modules/src/server/read-assets.ts': ['files'],
    },
    workspaces: {
        '.': baseConfig,
        'packages/*': workspaceConfig,
        'packages/arui-scripts': {
            ...workspaceConfig,
            // сохраняем зависимости опубликованного пакета при миграции линтеров
            ignoreDependencies: [
                ...workspaceConfig.ignoreDependencies,
                '@alfalab/postcss-custom-properties',
                '@rspack/cli',
                'babel-core',
                'mini-svg-data-uri',
                'rimraf',
                'semver',
                'shelljs',
                'strip-ansi',
                'tar',
                '@types/compression-webpack-plugin',
                '@types/semver',
                '@types/shelljs',
                '@types/tar',
            ],
            entry: [
                ...workspaceConfig.entry,
                'src/configs/vitest/config.ts',
                // совместимые пути утилит опубликованных версий
                'src/commands/util/{exec,yarn,docker-build,format-rspack-messages,print-build-error}.ts',
            ],
        },
        'packages/arui-scripts-server': {
            ...workspaceConfig,
            // публичные subpath-модули серверных адаптеров
            entry: [...workspaceConfig.entry, 'src/{express,hapi-16,hapi-20}.ts'],
        },
        'packages/example': {
            ...workspaceConfig,
            entry: [...workspaceConfig.entry, 'src/client.tsx', 'src/{polyfills.js,worker.ts}'],
            ignoreDependencies: [
                ...workspaceConfig.ignoreDependencies,
                'lodash',
                '@types/lodash',
                'postcss-preset-env',
            ],
        },
        'packages/example-modules': {
            ...workspaceConfig,
            // точки входа приложений задаются в arui-scripts.config.ts
            entry: [...workspaceConfig.entry, 'src/client.tsx'],
            ignoreDependencies: [
                ...workspaceConfig.ignoreDependencies,
                'lodash',
                '@types/lodash',
                'enzyme',
                'enzyme-adapter-react-16',
                '@types/enzyme',
            ],
        },
    },
};
