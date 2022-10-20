import path from 'path';

import fs from 'fs';

import webpack from 'webpack';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';
import configs from './app-configs';
import babelConf from './babel-server';
import postcssConf from './postcss';
import applyOverrides from './util/apply-overrides';
import getEntry from './util/get-entry';
import { babelDependencies } from './babel-dependencies';

const ReloadServerPlugin = require('../plugins/reload-server-webpack-plugin');

const assetsIgnoreBanner = fs.readFileSync(require.resolve('./util/node-assets-ignore'), 'utf8');

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

function getSingleEntry(entryPoint: string[]): string[] {
    const prefix = configs.useServerHMR ? [`${require.resolve('webpack/hot/poll')}?1000`] : [];
    return [...prefix, ...entryPoint];
}

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
const config: webpack.Configuration = {
    mode: 'development',
    devtool: configs.devSourceMaps,
    target: 'node',
    node: {
        __filename: true,
        __dirname: true
    },
    entry: getEntry(configs.serverEntry, getSingleEntry),
    context: configs.cwd,
    output: {
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,
        path: configs.serverOutputPath,
        publicPath: configs.publicPath,
        filename: configs.serverOutput,
        chunkFilename: '[name].js',
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: (info: any) =>
            path
                .relative(configs.appSrc, info.absoluteResourcePath)
                .replace(/\\/g, '/'),
    },
    cache: {
        type: 'filesystem',
        name: 'server',
        buildDependencies: {
            config: [__filename],
        },
    },
    externalsPresets: { node: true },
    externals: [nodeExternals({
        allowlist: [
            /^arui-feather/,
            /^arui-ft-private/,
            /^arui-private/,
            /^alfaform-core-ui/,
            /^@alfa-bank\/newclick-composite-components/,
            /^#/,
            /^@alfalab\/icons/,
            /^@alfalab\/core-components/,
            /^date-fns/,
        ],
        modulesFromFile: true,
    })],
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
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
        plugins: ([
            (configs.tsconfig && new TsconfigPathsPlugin({
                configFile: configs.tsconfig,
                extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx']
            }))
        ].filter(Boolean)) as NonNullable<webpack.Configuration['resolve']>['plugins'],
    },
    module: {
        // typescript interface will be removed from modules, and we will get an error on correct code
        // see https://github.com/webpack/webpack/issues/7378
        strictExportPresence: !configs.tsconfig,
        rules: [
            {
                oneOf: ([
                    // Process JS with Babel.
                    {
                        test: configs.useTscLoader ? /\.(js|jsx|mjs)$/ : /\.(js|jsx|mjs|ts|tsx)$/,
                        include: configs.appSrc,
                        loader: require.resolve('babel-loader'),
                        options: Object.assign({
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                        }, babelConf),
                    },
                    (configs.tsconfig && configs.useTscLoader) && {
                        test: /\.tsx?$/,
                        use: [
                            {
                                loader: require.resolve('babel-loader'),
                                options: Object.assign({
                                    // This is a feature of `babel-loader` for webpack (not Babel itself).
                                    // It enables caching results in ./node_modules/.cache/babel-loader/
                                    // directory for faster rebuilds.
                                    cacheDirectory: true
                                }, babelConf)
                            },
                            {
                                loader: require.resolve('ts-loader'),
                                options: {
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
                            cacheDirectory: true,
                            cacheCompression: false,
                        },
                    },
                    // replace css imports with empty files
                    {
                        test: cssRegex,
                        exclude: cssModuleRegex,
                        loader: require.resolve('null-loader')
                    },
                    {
                        test: cssModuleRegex,
                        use: [
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    modules: {
                                        exportOnlyLocals: true,
                                        getLocalIdent: getCSSModuleLocalIdent
                                    },
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    // Necessary for external CSS imports to work
                                    // https://github.com/facebookincubator/create-react-app/issues/2677
                                    ident: 'postcss',
                                    plugins: () => postcssConf,
                                },
                            },
                        ],
                    },
                    // "file" loader makes sure those assets get served by WebpackDevServer.
                    // When you `import` an asset, you get its (virtual) filename.
                    // In production, they would get copied to the `build` folder.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|jsx|mjs|ts|tsx)$/, /\.(html|ejs)$/, /\.json$/],
                        loader: require.resolve('file-loader'),
                        options: {
                            outputPath: configs.publicPath,
                            publicPath: configs.publicPath,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                ].filter(Boolean)) as webpack.RuleSetRule[],
            },
        ],
    },
    optimization: {
        nodeEnv: false,
    },
    plugins: ([
        configs.useServerHMR
            ? new RunScriptWebpackPlugin({
                name: configs.serverOutput
            })
            : new ReloadServerPlugin({ script: path.join(configs.serverOutputPath, configs.serverOutput) }),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.BannerPlugin({
            banner: assetsIgnoreBanner,
            raw: true,
            entryOnly: false
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebookincubator/create-react-app/issues/240
        new CaseSensitivePathsPlugin(),
        // If you require a missing module and then `npm install` it, you still have
        // to restart the development server for Webpack to discover it. This plugin
        // makes the discovery automatic so you don't have to restart.
        // See https://github.com/facebookincubator/create-react-app/issues/186
        new WatchMissingNodeModulesPlugin(configs.appNodeModules),
        configs.tsconfig !== null && new ForkTsCheckerWebpackPlugin(),
        configs.useServerHMR && new webpack.HotModuleReplacementPlugin(),
    ].filter(Boolean)) as webpack.WebpackPluginInstance[],
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
        hints: false,
    },
    experiments: {
        backCompat: configs.webpack4Compatibility,
    },
    watchOptions: {
        ignored: /node_modules/,
    }
};

const webpackServerDev = applyOverrides(['webpack', 'webpackServer', 'webpackDev', 'webpackServerDev'], config);

export default webpackServerDev;
