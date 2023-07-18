import path from 'path';
import webpack, { Configuration } from 'webpack';

import { WebpackManifestPlugin } from 'webpack-manifest-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';

import getEntry, { Entry } from './util/get-entry';
import configs from './app-configs';
import babelConf from './babel-client';
import postcssConf from './postcss';
import checkNodeVersion from './util/check-node-version';
import { babelDependencies } from './babel-dependencies';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { WebpackDeduplicationPlugin } from 'webpack-deduplication-plugin';
import { getImageMin } from "./config-extras/minimizers";
import svgToMiniDataURI from "mini-svg-data-uri";
import {
    processAssetsPluginOutput,
} from './process-assets-plugin-output';

const PnpWebpackPlugin = require('pnp-webpack-plugin');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const noopPath = require.resolve('./util/noop');

function getSingleEntry(entryPoint: string[], mode: 'dev' | 'prod') {
    return [
        ...(Array.isArray(configs.clientPolyfillsEntry) ? configs.clientPolyfillsEntry : [configs.clientPolyfillsEntry]),
        ...entryPoint
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

/**
 * Создает конфигурацию для сборки клиентского кода. Может быть использована для создания дополнительных конфигураций.
 * @param mode Режим сборки (dev или prod)
 * @param entry Точка входа, любой валидный вход для webpack
 * @param configName Имя конфигурации, если не указано, то используется имя по умолчанию
 */
const createSingleClientWebpackConfig = (mode: 'dev' | 'prod', entry: Entry, configName?: string): Configuration => ({
    target: 'web',
    mode: mode === 'dev' ? 'development' : 'production',
    devtool: mode === 'dev' ? configs.devSourceMaps : 'source-map',
    entry: getEntry(entry, getSingleEntry, mode),
    // in production mode we need to fail on first error
    bail: mode === 'prod',
    context: configs.cwd,
    name: configName,
    output: {
        assetModuleFilename: 'static/media/[name].[hash:8][ext]',
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: mode === 'dev',
        path: configs.clientOutputPath,
        publicPath: configs.publicPath,
        filename: mode === 'dev' ? '[name].js' : '[name].[chunkhash:8].js',
        chunkFilename: mode === 'dev'
            ? `${configName ? `${configName}-` : ''}[name].js`
            : `${configName ? `${configName}-` : ''}[name].[chunkhash:8].chunk.js`,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: (info: any) =>
            path
                .relative(configs.appSrc, info.absoluteResourcePath)
                .replace(/\\/g, '/'),
    },
    optimization: {
        splitChunks: mode === 'prod'
            ? {
                chunks: "all",
                cacheGroups: {
                    commons: {
                        chunks: "initial",
                        minChunks: 2,
                        maxInitialRequests: 5, // The default limit is too small to showcase the effect
                        minSize: 0 // This is example is too small to create commons chunks
                    },
                    vendor: {
                        test: /node_modules/,
                        chunks: "initial",
                        name: (
                            _: unknown,
                            chunks: any[],
                            cacheGroupKey: string,
                        ) => {
                            if (!configName) {
                                return 'vendor';
                            }
                            // Нам нужно сделать так, чтобы у разных конфигураций были разные имена чанков
                            const allChunksNames = chunks.map((item) => item.name).join('~');
                            return `${cacheGroupKey}-${allChunksNames}`;
                        },
                        priority: 10,
                        enforce: true
                    }
                }
            }
            : false,
        minimize: mode === 'prod',
        minimizer: [
            ...getImageMin(),
            // This is only used in production mode
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
            new CssMinimizerPlugin()
        ].filter(Boolean),
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
        plugins: ([
            (configs.tsconfig && new TsconfigPathsPlugin({
                configFile: configs.tsconfig,
                extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx']
            })),
        ].filter(Boolean)) as NonNullable<webpack.Configuration['resolve']>['plugins'],
    },
    resolveLoader: {
        plugins: [
            PnpWebpackPlugin.moduleLoader(module),
        ],
    },
    cache: mode === 'dev'
        ? {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename],
            },
        }
        : false,
    module: {
        // typescript interface will be removed from modules, and we will get an error on correct code
        // see https://github.com/webpack/webpack/issues/7378
        strictExportPresence: !configs.tsconfig,
        rules: [
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: ([
                    // Process JS with Babel.
                    {
                        test: configs.useTscLoader ? /\.(js|jsx|mjs|cjs)$/ : /\.(js|jsx|mjs|ts|tsx|cjs)$/,
                        include: configs.appSrc,
                        loader: require.resolve('babel-loader'),
                        options: {
                            ...babelConf,
                            cacheDirectory: mode === 'dev',
                            cacheCompression: false,
                            plugins: [
                                ...babelConf.plugins,
                                mode === 'dev' ? [require.resolve('react-refresh/babel'), {skipEnvCheck: true}] : undefined
                            ].filter(Boolean),
                        },
                    },
                    (configs.tsconfig && configs.useTscLoader) && {
                        test: /\.tsx?$/,
                        use: [
                            {
                                loader: require.resolve('babel-loader'),
                                options: Object.assign({
                                    cacheDirectory: mode === 'dev',
                                    cacheCompression: false,
                                    plugins: mode === 'dev' ? [require.resolve('react-refresh/babel'), {skipEnvCheck: true}] : undefined,
                                }, babelConf)
                            },
                            {
                                loader: require.resolve('ts-loader'),
                                options: {
                                    getCustomTransformers: () => ({
                                        before: mode === 'dev' ? [ReactRefreshTypeScript()] : [],
                                    }),
                                    onlyCompileBundledFiles: true,
                                    transpileOnly: true,
                                    happyPackMode: true,
                                    configFile: configs.tsconfig
                                }
                            }
                        ]
                    },
                    // Process any JS outside of the app with Babel.
                    // Unlike the application JS, we only compile the standard ES features.
                    {
                        test: /\.(js|mjs)$/,
                        exclude: /@babel(?:\/|\\{1,2})runtime/,
                        loader: require.resolve('babel-loader'),
                        options: {
                            ...babelDependencies,
                            babelrc: false,
                            configFile: false,
                            compact: false,
                            cacheDirectory: mode === 'dev',
                            cacheCompression: false,
                        },
                    },
                    // process simple css files with postcss loader and css loader
                    {
                        test: /\.css$/,
                        exclude: /\.module\.css$/,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: { publicPath: './' }
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
                                    }
                                },
                            },
                        ],
                    },
                    // process all *.module.css files with postcss loader and css loader
                    {
                        test: /\.module\.css$/,
                        use: [
                            {
                                loader: MiniCssExtractPlugin.loader,
                                options: { publicPath: './' }
                            },
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                    sourceMap: mode === 'dev',
                                    modules: {
                                        getLocalIdent: getCSSModuleLocalIdent
                                    },
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    postcssOptions: {
                                        plugins: postcssConf,
                                    }
                                },
                            },
                        ],
                    },
                    {
                        test: /\.svg/,
                        type: 'asset',
                        generator: {
                            dataUrl: (content: Buffer) => svgToMiniDataURI(content.toString())
                        },
                        parser: {
                            dataUrlCondition: {
                                maxSize: configs.dataUrlMaxSize
                            }
                        }
                    },
                    {
                        exclude: [/\.(js|jsx|mjs|cjs|ts|tsx)$/, /\.(html|ejs)$/, /\.json$/],
                        type: 'asset',
                        parser: {
                            dataUrlCondition: {
                                maxSize: configs.dataUrlMaxSize
                            }
                        }
                    },
                ].filter(Boolean)) as webpack.RuleSetRule[],
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before asset modules
        ],
    },
    plugins: ([
        assetsPlugin,
        clientAssetsPlugin,
        new webpack.DefinePlugin({
            // Tell Webpack to provide empty mocks for process.env.
            'process.env': '{}',
            // В прод режиме webpack автоматически подставляет NODE_ENV=production, но нам нужно чтобы эта переменная
            // была доступна всегда. При этом мы не хотим давать возможность переопределять ее в production режиме.
            ...(mode === 'dev'
                ? { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) }
                : {}
            ),
        }),
        new MiniCssExtractPlugin({
            filename: mode === 'dev' ? '[name].css' : '[name].[contenthash:8].css',
            chunkFilename: mode === 'dev' ? '[id].css' : '[name].[contenthash:8].chunk.css',
        }),
        configs.tsconfig !== null && new ForkTsCheckerWebpackPlugin(),
        // moment.js очень большая библиотека, которая включает в себя массу локализаций, которые мы не используем.
        // Поэтому мы их просто игнорируем, чтобы не включать в сборку.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        // Этот плагин позволяет избавиться от одинаковых зависимостей, которые могут появляться из-за того, что одна и та же
        // библиотека является зависимостью в разных версиях для разных библиотек.
        // например проект зависит от lodash@1, библиотеки A и B зависят от lodash@2. Тогда lodash@2 будет включен в сборку
        // дважды, что приведет к увеличению размера бандла (и это не лечится дедубликацией в yarn/npm).
        // Сама реализация плагина зависит от yarn.lock, поэтому если мы используем npm, то плагин не будет работать.
        configs.useYarn && new WebpackDeduplicationPlugin({
            cacheDir: path.join(configs.cwd, 'node_modules/.cache/deduplication-webpack-plugin/'),
            rootPath: configs.cwd,
        }),
        // dev plugins:
        mode === 'dev' && new ReactRefreshWebpackPlugin({
            overlay: false,
        }),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebookincubator/create-react-app/issues/240
        mode === 'dev' && new CaseSensitivePathsPlugin(),

        // production plugins:
        mode === 'prod' && new WebpackManifestPlugin(),
        mode === 'prod' && new CompressionPlugin({
            filename: '[file].gz',
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.png$|\.svg$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        mode === 'prod' && checkNodeVersion(10) && new CompressionPlugin({
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
        mode === 'prod' && !configs.keepPropTypes && new webpack.NormalModuleReplacementPlugin(
            /^react-style-proptype$/,
            noopPath
        ),
        mode === 'prod' && !configs.keepPropTypes && new webpack.NormalModuleReplacementPlugin(
            /^thrift-services\/proptypes/,
            noopPath
        )
    ].filter(Boolean)),
    experiments: {
        backCompat: configs.webpack4Compatibility,
    },
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

// Для того чтобы предоставить пользователям удобный способ создать свой конфиг, мы предоставляем функцию,
// которая создает конфиг для клиентской части приложения. При этом мы не хотим заставлять пользователей
// думать про dev/prod режимы, поэтому мы автоматически определяем режим при инициализации и сохраняем его в переменную.
let lastUsedMode: 'dev' | 'prod' | null = null;

export const createClientWebpackConfig = (mode: 'dev' | 'prod') => {
    lastUsedMode = mode;
    return createSingleClientWebpackConfig(mode, configs.clientEntry);
}

export const createSingleWebpackConfig = (entry: Entry, configName: string) => {
    return createSingleClientWebpackConfig(lastUsedMode || 'dev', entry, configName);
}
