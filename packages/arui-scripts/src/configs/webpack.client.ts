// TODO: remove eslint-disable and eslint-disable-next-line
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';

import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import rspack, { Configuration } from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import AssetsPlugin from 'assets-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import svgToMiniDataURI from 'mini-svg-data-uri';
import { RspackManifestPlugin } from 'rspack-manifest-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { WebpackDeduplicationPlugin } from 'webpack-deduplication-plugin';

import { AruiRuntimePlugin, getInsertCssRuntimeMethod } from '../plugins/arui-runtime';
import { htmlTemplate } from '../templates/html.template';

import { getImageMin } from './config-extras/minimizers';
import checkNodeVersion from './util/check-node-version';
import getEntry, { Entry } from './util/get-entry';
import { configs } from './app-configs';
import babelConf from './babel-client';
import { babelDependencies } from './babel-dependencies';
import { addEnvToHtmlTemplate, ClientConfigPlugin } from './client-env-config';
import { patchMainWebpackConfigForModules, patchWebpackConfigForCompat } from './modules';
import postcssConf from './postcss';
import { processAssetsPluginOutput } from './process-assets-plugin-output';
import { swcClientConfig } from './swc';

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const noopPath = require.resolve('./util/noop');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSingleEntry(entryPoint: string[], mode: 'dev' | 'prod') {
    return [
        ...(Array.isArray(configs.clientPolyfillsEntry)
            ? configs.clientPolyfillsEntry
            : [configs.clientPolyfillsEntry]),
        ...entryPoint,
    ].filter(Boolean) as string[];
}

// Нам важно шарить assets plugin между разными сборками, чтобы файл не перезаписывался
const assetsPlugin = new AssetsPlugin({
    path: configs.serverOutputPath,
    processOutput: processAssetsPluginOutput,
});
// Этот плагин нужен для того, чтобы клиентский код так же могу получить информацию о сборке.
// Это позволяет нам использовать данные о сборки на клиенте.
const clientAssetsPlugin = new AssetsPlugin({
    path: configs.clientOutputPath,
    processOutput: processAssetsPluginOutput,
});

function getMinimizeConfig(mode: 'dev' | 'prod') {
    if (mode === 'prod') {
        return {
            minimize: true,
            minimizer: [
                ...getImageMin(),
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            // we want terser to parse ecma 8 code. However, we don't want it
                            // to apply any minfication steps that turns valid ecma 5 code
                            // into invalid ecma 5 code. This is why the 'compress' and 'output'
                            // sections only apply transformations that are ecma 5 safe
                            // https://github.com/facebook/create-react-app/pull/4234
                            ecma: 2017,
                        },
                        compress: {
                            ecma: 5,
                            // Disabled because of an issue with Uglify breaking seemingly valid code:
                            // https://github.com/facebook/create-react-app/issues/2376
                            // Pending further investigation:
                            // https://github.com/mishoo/UglifyJS2/issues/2011
                            comparisons: false,
                            // Disabled because of an issue with Terser breaking valid code:
                            // https://github.com/facebook/create-react-app/issues/5250
                            // Pending futher investigation:
                            // https://github.com/terser-js/terser/issues/120
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            // Turned on because emoji and regex is not minified properly using default
                            // https://github.com/facebook/create-react-app/issues/2488
                            ascii_only: true,
                        },
                    },
                    // Use multi-process parallel running to improve the build speed
                    // Default number of concurrent runs: os.cpus().length - 1
                    parallel: true,
                }),
                new CssMinimizerPlugin(),
            ].filter(Boolean),
        };
    }

    if (configs.keepCssVars) {
        // Каждый импорт css файла с переменными приводит к дублированию всего набора.
        // Чтобы этого избежать — проходимся плагином, который удалит дубли из выходного файла.
        return {
            minimize: true,
            minimizer: [
                new CssMinimizerPlugin({
                    minimizerOptions: {
                        preset: () => ({
                            plugins: [require('postcss-discard-duplicates')],
                        }),
                    },
                }),
            ],
        };
    }

    return {
        minimize: false,
        minimizer: [],
    };
}

/**
 * Создает конфигурацию для сборки клиентского кода. Может быть использована для создания дополнительных конфигураций.
 * @param mode Режим сборки (dev или prod)
 * @param entry Точка входа, любой валидный вход для webpack
 * @param configName Имя конфигурации, если не указано, то используется имя по умолчанию
 */
// eslint-disable-next-line complexity
export const createSingleClientWebpackConfig = (
    mode: 'dev' | 'prod',
    entry: Entry,
    configName?: string,
): Configuration => ({
    ...(configName ? { name: configName } : {}), // Если добавлять имя конфигурации всегда - могут ломаться оверрайды, которые считают что у дефолтной конфигурации нет имени
    target: 'web',
    mode: mode === 'dev' ? 'development' : 'production',
    devtool: mode === 'dev' ? configs.devSourceMaps : 'source-map',
    entry: getEntry(entry, getSingleEntry, mode),
    // in production mode we need to fail on first error
    bail: mode === 'prod',
    context: configs.cwd,
    experiments: {
        css: false,
    },
    output: {
        assetModuleFilename: 'static/media/[name].[hash:8][ext]',
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: mode === 'dev',
        path: configs.clientOutputPath,
        publicPath: configs.publicPath,
        filename: mode === 'dev' ? '[name].js' : '[name].[chunkhash:8].js',
        chunkFilename:
            mode === 'dev'
                ? `${configName ? `${configName}-` : ''}[name].js`
                : `${configName ? `${configName}-` : ''}[name].[chunkhash:8].chunk.js`,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: (info: any) =>
            path.relative(configs.appSrc, info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    optimization: {
        ...getMinimizeConfig(mode),
        splitChunks:
            mode === 'prod'
                ? {
                      chunks: 'all',
                      cacheGroups: {
                          commons: {
                              chunks: 'initial',
                              minChunks: 2,
                              minSize: 0, // This is example is too small to create commons chunks
                          },
                          vendor: {
                              test: /node_modules/,
                              chunks: 'initial',
                              name: (_, chunks, cacheGroupKey) => {
                                  if (!configName) {
                                      return 'vendor';
                                  }
                                  // Нам нужно сделать так, чтобы у разных конфигураций были разные имена чанков
                                  const allChunksNames = (chunks as Array<{name: string}>).map((item) => item.name).join('~');

                                  return `${cacheGroupKey}-${allChunksNames}`;
                              },
                              priority: 10,
                              enforce: true,
                          },
                      },
                  }
                : false,
        nodeEnv: mode === 'prod' ? 'production' : false,

        // Оптимизации времени билда, см https://webpack.js.org/guides/build-performance/
        removeAvailableModules: mode !== 'dev',
        removeEmptyChunks: mode !== 'dev',
    },
    resolve: {
        // This allows you to set a fallback for where Webpack should look for modules.
        // We placed these paths second because we want `node_modules` to "win"
        // if there are any conflicts. This matches Node resolution mechanism.
        // https://github.com/facebookincubator/create-react-app/issues/253
        modules: ['node_modules', configs.appNodeModules],
        // These are the reasonable defaults supported by the Node ecosystem.
        // We also include JSX as a common component filename extension to support
        // some tools, although we do not recommend using it, see:
        // https://github.com/facebookincubator/create-react-app/issues/290
        // `web` extension prefixes have been added for better support
        // for React Native Web.
        extensions: ['.web.js', '.mjs', '.cjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
        tsConfig: configs.tsconfig ? { configFile: configs.tsconfig } : undefined,
    },
    resolveLoader: {
    },
    cache:
        mode === 'dev',
    module: {
        rules: [
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // Обработка основного кода приложения
                    getCodeLoader(mode),
                    // обработка ts кода если codeLoader = tsc
                    getTsLoaderIfEnabled(mode),
                    // Обработка внешнего для приложения кода (node_modules)
                    getExternalCodeLoader(mode),
                    // process simple css files with postcss loader and css loader
                    {
                        test: /\.css$/,
                        exclude: /\.module\.css$/,
                        use: [
                            {
                                loader: rspack.CssExtractRspackPlugin.loader,
                                options: { publicPath: './' },
                            },
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                    sourceMap: mode === 'dev',
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    postcssOptions: {
                                        plugins: postcssConf,
                                    },
                                },
                            },
                        ],
                    },
                    // process all *.module.css files with postcss loader and css loader
                    {
                        test: /\.module\.css$/,
                        use: [
                            {
                                loader: rspack.CssExtractRspackPlugin.loader,
                                options: { publicPath: './' },
                            },
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                    sourceMap: mode === 'dev',
                                    modules: {
                                        getLocalIdent: getCSSModuleLocalIdent,
                                    },
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    postcssOptions: {
                                        plugins: postcssConf,
                                    },
                                },
                            },
                        ],
                    },
                    {
                        test: /\.svg/,
                        type: 'asset',
                        generator: {
                            dataUrl: (content: Buffer) => svgToMiniDataURI(content.toString()),
                        },
                        parser: {
                            dataUrlCondition: {
                                maxSize: configs.dataUrlMaxSize,
                            },
                        },
                    },
                    {
                        exclude: [/\.(js|jsx|mjs|cjs|ts|tsx)$/, /\.(html|ejs)$/, /\.json$/],
                        type: 'asset',
                        parser: {
                            dataUrlCondition: {
                                maxSize: configs.dataUrlMaxSize,
                            },
                        },
                    },
                ].filter(Boolean) as rspack.RuleSetRule[],
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before asset modules
        ],
    },
    plugins: [
        assetsPlugin,
        clientAssetsPlugin,
        new rspack.DefinePlugin({
            // Tell Webpack to provide empty mocks for process.env.
            'process.env': '{}',
            // В прод режиме webpack автоматически подставляет NODE_ENV=production, но нам нужно чтобы эта переменная
            // была доступна всегда. При этом мы не хотим давать возможность переопределять ее в production режиме.
            ...(mode === 'dev'
                ? { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }
                : {}),
        }),
        new rspack.CssExtractRspackPlugin(
            (() => {
                const prefix = `${configName ? `${configName}-` : ''}`;

                return {
                    ignoreOrder: true,
                    filename:
                        mode === 'dev'
                            ? `${prefix}[name].css`
                            : `${prefix}[name].[contenthash:8].css`,
                    chunkFilename:
                        mode === 'dev'
                            ? `${prefix}[name].css`
                            : `${prefix}[name].[contenthash:8].chunk.css`,
                    insert: getInsertCssRuntimeMethod() as any,
                };
            })(),
        ),
        (mode === 'prod' || !configs.disableDevWebpackTypecheck) &&
            configs.tsconfig !== null &&
            configs.codeLoader !== 'tsc' &&
            new ForkTsCheckerWebpackPlugin(),
        // moment.js очень большая библиотека, которая включает в себя массу локализаций, которые мы не используем.
        // Поэтому мы их просто игнорируем, чтобы не включать в сборку.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        new rspack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        // Этот плагин позволяет избавиться от одинаковых зависимостей, которые могут появляться из-за того, что одна и та же
        // библиотека является зависимостью в разных версиях для разных библиотек.
        // например проект зависит от lodash@1, библиотеки A и B зависят от lodash@2. Тогда lodash@2 будет включен в сборку
        // дважды, что приведет к увеличению размера бандла (и это не лечится дедубликацией в yarn/npm).
        // Сама реализация плагина зависит от yarn.lock, поэтому если мы используем npm, то плагин не будет работать.
        configs.useYarn &&
            new WebpackDeduplicationPlugin({
                cacheDir: path.join(
                    configs.cwd,
                    'node_modules/.cache/deduplication-webpack-plugin/',
                ),
                rootPath: configs.cwd,
            }),
        // dev plugins:
        mode === 'dev' && new ReactRefreshPlugin(),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebookincubator/create-react-app/issues/240
        mode === 'dev' && new CaseSensitivePathsPlugin(),
        new AruiRuntimePlugin(),
        configs.clientOnly &&
            new HtmlWebpackPlugin({
                templateContent: mode === 'dev'
                    ? addEnvToHtmlTemplate(htmlTemplate)
                    : htmlTemplate, // оставляем env шаблоны как есть для прод сборки - их будет менять start.sh
                filename: '../index.html',
            }),
        mode === 'dev' && configs.clientOnly && new ClientConfigPlugin(),

        // production plugins:
        mode === 'prod' && new RspackManifestPlugin({}),
        mode === 'prod' &&
            new CompressionPlugin({
                filename: '[file].gz',
                algorithm: 'gzip',
                test: /\.js$|\.css$|\.png$|\.svg$/,
                threshold: 10240,
                minRatio: 0.8,
            }),
        mode === 'prod' &&
            checkNodeVersion(10) &&
            new CompressionPlugin({
                filename: '[file].br',
                algorithm: 'brotliCompress',
                test: /\.(js|css|html|svg)$/,
                compressionOptions: {
                    level: 11,
                },
                threshold: 10240,
                minRatio: 0.8,
            }),
        // Ignore prop-types packages in production mode
        // This should works fine, since proptypes usage should be eliminated in production mode
        mode === 'prod' &&
            !configs.keepPropTypes &&
            new rspack.NormalModuleReplacementPlugin(/^react-style-proptype$/, noopPath),
        mode === 'prod' &&
            !configs.keepPropTypes &&
            new rspack.NormalModuleReplacementPlugin(/^thrift-services\/proptypes/, noopPath),
    ].filter(Boolean) as rspack.RspackPluginInstance[],
    // Без этого комиляция трирегилась на изменение в node_modules и приводила к утечке памяти
    watchOptions: {
        ignored: new RegExp(configs.watchIgnorePath.join('|')),
        aggregateTimeout: 100,
    },
    // Выключаем performance hints, т.к. размеры бандлов контролируются не в рамках arui-scripts
    performance: {
        hints: false,
    },
});

export const createClientWebpackConfig = (mode: 'dev' | 'prod') => {
    const appWebpackConfig = patchMainWebpackConfigForModules(
        createSingleClientWebpackConfig(mode, configs.clientEntry),
    );

    const exposedCompatModules = configs.compatModules?.exposes;

    if (!exposedCompatModules || Object.keys(exposedCompatModules).length === 0) {
        return appWebpackConfig;
    }

    // Добавляем отдельные конфигурации для compat модулей
    const modulesWebpackConfigs = Object.keys(exposedCompatModules).map((moduleName) => {
        const module = {
            name: moduleName,
            ...exposedCompatModules[moduleName],
        };
        const config = createSingleClientWebpackConfig(
            mode,
            {
                [module.name]: module.entry,
            },
            module.name,
        );

        return patchWebpackConfigForCompat(module, config);
    });

    return [appWebpackConfig, ...modulesWebpackConfigs];
};

function getCodeLoader(mode: 'dev' | 'prod'): rspack.RuleSetRule {
    if (configs.codeLoader === 'swc') {
        return {
            test: /\.(js|jsx|mjs|ts|tsx|cjs)$/,
            include: configs.appSrc,
            loader: 'builtin:swc-loader',
            options: {
                cacheDirectory: mode === 'dev',
                cacheCompression: false,
                ...swcClientConfig,
                jsc: {
                    ...swcClientConfig.jsc,
                    transform: {
                        ...swcClientConfig.jsc?.transform,
                        react: {
                            ...swcClientConfig.jsc?.transform?.react,
                            refresh: mode === 'dev',
                        },
                    },
                },
            },
        };
    }

    return {
        test: configs.codeLoader === 'tsc'
            ? /\.(js|jsx|mjs|cjs)$/
            : /\.(js|jsx|mjs|ts|tsx|cjs)$/,
        include: configs.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
            ...babelConf,
            cacheDirectory: mode === 'dev',
            cacheCompression: false,
            plugins: [
                ...babelConf.plugins,
                mode === 'dev'
                    ? [
                        require.resolve('react-refresh/babel'),
                        { skipEnvCheck: true },
                    ]
                    : undefined,
            ].filter(Boolean),
        },
    };
}

function getTsLoaderIfEnabled(mode: 'dev' | 'prod'): rspack.RuleSetRule | false {
    if (configs.codeLoader !== 'tsc' || !configs.tsconfig) {
        return false;
    }

    return {
        test: /\.tsx?$/,
        use: [
            {
                loader: require.resolve('babel-loader'),
                options: {
                    ...babelConf,
                    cacheDirectory: mode === 'dev',
                    cacheCompression: false,
                    plugins:
                        mode === 'dev'
                            ? [
                                require.resolve('react-refresh/babel'),
                                { skipEnvCheck: true },
                            ]
                            : undefined,
                },
            },
            {
                loader: require.resolve('ts-loader'),
                options: {
                    getCustomTransformers: () => ({
                        before:
                            mode === 'dev' ? [ReactRefreshTypeScript()] : [],
                    }),
                    onlyCompileBundledFiles: true,
                    transpileOnly: true,
                    happyPackMode: true,
                    configFile: configs.tsconfig,
                },
            },
        ],
    }
}

function getExternalCodeLoader(mode: 'dev' | 'prod'): rspack.RuleSetRule {
    const baseLoaderConfig = {
        test: /\.(js|mjs)$/,
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        resolve: {
            fullySpecified: false,
        },
    };

    if (configs.codeLoader === 'swc') {
        return {
            ...baseLoaderConfig,
            loader: require.resolve('swc-loader'),
            options: {
                cacheDirectory: mode === 'dev',
                cacheCompression: false,
            },
        };
    }

    return {
        ...baseLoaderConfig,
        loader: require.resolve('babel-loader'),
        options: {
            ...babelDependencies,
            babelrc: false,
            configFile: false,
            compact: false,
            cacheDirectory: mode === 'dev',
            cacheCompression: false,
        },
    };
}
