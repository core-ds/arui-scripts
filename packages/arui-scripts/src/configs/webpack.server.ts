// TODO: remove eslint-disable
/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs';
import path from 'path';

import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';
import webpack, { Configuration } from '@rspack/core';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import nodeExternals from 'webpack-node-externals';

import { ReloadServerPlugin } from '../plugins/reload-server-plugin';
import { WatchMissingNodeModulesPlugin } from '../plugins/watch-missing-node-modules-plugin';

import getEntry from './util/get-entry';
import configs from './app-configs';
import { babelDependencies } from './babel-dependencies';
import babelConf from './babel-server';
import postcssConf from './postcss';
import { serverExternalsExemptions } from './server-externals-exemptions';
import { swcServerConfig } from './swc';

const assetsIgnoreBanner = fs.readFileSync(require.resolve('./util/node-assets-ignore'), 'utf8');
const sourceMapSupportBanner = fs.readFileSync(
    require.resolve('./util/install-sourcemap-support'),
    'utf8',
);

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;

function getSingleEntry(entryPoint: string[], mode: 'dev' | 'prod') {
    const prefix =
        mode === 'dev' && configs.useServerHMR
            ? [`${require.resolve('webpack/hot/poll')}?1000`]
            : [];

    return [...prefix, ...entryPoint];
}

// This is a function that wil return webpack configuration to build a server
export const createServerConfig = (mode: 'dev' | 'prod'): Configuration => ({
    mode: mode === 'dev' ? 'development' : 'production',
    // fail on first error in production mode
    bail: mode === 'prod',
    devtool: mode === 'dev' ? configs.devSourceMaps : 'source-map' as any,
    target: 'node',
    node: {
        __filename: true,
        __dirname: true,
    },
    entry: getEntry(configs.serverEntry, getSingleEntry, mode),
    context: configs.cwd,
    output: {
        assetModuleFilename: 'static/media/[name].[hash:8][ext]',
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,
        path: configs.serverOutputPath,
        publicPath: configs.publicPath,
        filename: configs.serverOutput,
        chunkFilename: '[name].js',
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: (info: any) =>
            path.relative(configs.appSrc, info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    cache: mode === 'dev',
    externalsPresets: { node: true },
    externals: [
        nodeExternals({
            allowlist: serverExternalsExemptions,
            // we cannot determine node_modules location before arui-scripts installation, so just load
            // dependencies list from package.json
            modulesFromFile: true,
        }),
    ] as Configuration['externals'],
    optimization: {
        minimize: false,
        nodeEnv: mode === 'dev' ? false : 'production',
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
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
        tsConfig: configs.tsconfig ? { configFile: configs.tsconfig } : undefined,
    },
    module: {
        // typescript interface will be removed from modules, and we will get an error on correct code
        // see https://github.com/webpack/webpack/issues/7378
        // strictExportPresence: !configs.tsconfig,
        rules: [
            {
                oneOf: [
                    // Обработка основного кода приложения
                    getCodeLoader(mode),
                    // обработка ts кода если codeLoader = tsc
                    getTsLoaderIfEnabled(mode),
                    // Обработка внешнего для приложения кода (node_modules)
                    getExternalCodeLoader(mode),
                    // replace css imports with empty files
                    {
                        test: cssRegex,
                        exclude: cssModuleRegex,
                        loader: require.resolve('null-loader'),
                    },
                    {
                        test: cssModuleRegex,
                        use: [
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    modules: {
                                        exportOnlyLocals: true,
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
                        exclude: [/\.(js|jsx|mjs|ts|tsx)$/, /\.(html|ejs)$/, /\.json$/],
                        type: 'asset/resource',
                        generator: {
                            outputPath: configs.publicPath,
                            publicPath: configs.publicPath,
                        },
                    },
                ].filter(Boolean) as webpack.RuleSetRule[],
            },
        ],
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: assetsIgnoreBanner,
            raw: true,
            entryOnly: false,
        }),
        configs.installServerSourceMaps &&
            new webpack.BannerPlugin({
                banner: sourceMapSupportBanner,
                raw: true,
                entryOnly: false,
            }),

        // dev plugins:
        mode === 'dev' &&
            (configs.useServerHMR
                ? new RunScriptWebpackPlugin({
                      name: configs.serverOutput,
                  })
                : new ReloadServerPlugin({
                      script: path.join(configs.serverOutputPath, configs.serverOutput),
                  })),
        // mode === 'dev' && new webpack.NoEmitOnErrorsPlugin(),
        // Watcher doesn't work well if you mistype casing in a path so we use
        // a plugin that prints an error when you attempt to do this.
        // See https://github.com/facebookincubator/create-react-app/issues/240
        mode === 'dev' && new CaseSensitivePathsPlugin(),
        // If you require a missing module and then `npm install` it, you still have
        // to restart the development server for Webpack to discover it. This plugin
        // makes the discovery automatic so you don't have to restart.
        // See https://github.com/facebookincubator/create-react-app/issues/186
        mode === 'dev' && new WatchMissingNodeModulesPlugin(configs.appNodeModules),
        mode === 'dev' && configs.useServerHMR && new webpack.HotModuleReplacementPlugin(),
    ].filter(Boolean) as webpack.RspackPluginInstance[],
    // Без этого комиляция трирегилась на изменение в node_modules и приводила к утечке памяти
    watchOptions: {
        ignored: new RegExp(configs.watchIgnorePath.join('|')),
        aggregateTimeout: 100,
    },
    performance: {
        // we don't really care about bundle size for server
        hints: false,
    },
});

function getCodeLoader(mode: 'dev' | 'prod'): webpack.RuleSetRule {
    if (configs.codeLoader === 'swc') {
        return {
            test: /\.(js|jsx|mjs|ts|tsx|cjs)$/,
            include: configs.appSrc,
            loader: 'builtin:swc-loader',
            options: swcServerConfig,
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
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: mode === 'dev',
        },
    };
}

function getTsLoaderIfEnabled(mode: 'dev' | 'prod'): webpack.RuleSetRule | false {
    if (configs.codeLoader !== 'tsc' || !configs.tsconfig) {
        return false;
    }

    return {
        test: /\.tsx?$/,
        use: [
            {
                loader: require.resolve('babel-loader'),
                options: {
                    // This is a feature of `babel-loader` for webpack (not Babel itself).
                    // It enables caching results in ./node_modules/.cache/babel-loader/
                    // directory for faster rebuilds.
                    cacheDirectory: mode === 'dev',
                    ...babelConf,
                },
            },
            {
                loader: require.resolve('ts-loader'),
                options: {
                    onlyCompileBundledFiles: true,
                    transpileOnly: true,
                    happyPackMode: true,
                    configFile: configs.tsconfig,
                },
            },
        ],
    };
}

function getExternalCodeLoader(mode: 'dev' | 'prod'): webpack.RuleSetRule {
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
            loader: 'builtin:swc-loader',
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
