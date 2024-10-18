import { Cluster } from 'cluster';

import { ReactRefreshPluginOptions } from '@pmmmwh/react-refresh-webpack-plugin/types/lib/types';
import rspack, { type CssExtractRspackPluginOptions } from '@rspack/core';
import AssetsPlugin from 'assets-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import { ForkTsCheckerWebpackPluginOptions } from 'fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import { WebpackDeduplicationPlugin } from 'webpack-deduplication-plugin';
import { WebpackManifestPlugin } from 'webpack-manifest-plugin';

/*
    вариации плагинов клиента
    Сюда не попали:
        1. ModuleFederationPlugin
*/
type PluginsListClient = {
    AssetsWebpackPlugin: {
        options: AssetsPlugin.Options;
    };
    DefinePlugin: {
        definitions: ConstructorParameters<typeof rspack.DefinePlugin>[number];
    };
    CssExtractRspackPlugin: {
        options: CssExtractRspackPluginOptions;
    };
    MiniCssExtractPlugin: {
        options: MiniCssExtractPlugin.PluginOptions;
        runtimeOptions: MiniCssExtractPlugin.RuntimeOptions;
    };
    ForkTsCheckerWebpackPlugin: {
        options: ForkTsCheckerWebpackPluginOptions;
    };
    IgnorePlugin: {
        options:
            | {
                  contextRegExp?: RegExp;
                  resourceRegExp: RegExp;
              }
            | {
                  checkResource: (resource: string, context: string) => boolean;
              };
    };
    WebpackDeduplicationPlugin: WebpackDeduplicationPlugin;
    ReactRefreshPlugin: {
        options: ReactRefreshPluginOptions;
    };
    CaseSensitivePathsPlugin: {
        options: CaseSensitivePathsPlugin.Options;
        logger: {
            [K in keyof Console]: Console[K];
        };
    };
    WebpackManifestPlugin: {
        options: ConstructorParameters<typeof WebpackManifestPlugin>[number];
    };
    CompressionPlugin: {
        options: ConstructorParameters<typeof CompressionPlugin>[number];
    };
    NormalModuleReplacementPlugin: rspack.NormalModuleReplacementPlugin;
};

/*
    вариации плагинов сервера
    сюда не попали:
        1. HotModuleReplacementPlugin
        2. NoEmitOnErrorsPlugin
 */
type PluginsListServer = {
    RunScriptWebpackPlugin: {
        options: ConstructorParameters<typeof RunScriptWebpackPlugin>[number];
    };
    ReloadServerPlugin: {
        done: (...props: unknown[]) => unknown | null;
        workers: Array<Cluster['Worker']>;
    };
    CaseSensitivePathsPlugin: {
        options: CaseSensitivePathsPlugin.Options;
        logger: {
            [K in keyof Console]: Console[K];
        };
    };
    WatchMissingNodeModulesPlugin: {
        nodeModulesPath: string;
    };
};

type SelectedPluginsList<Type extends 'client' | 'server'> = Type extends 'client'
    ? PluginsListClient
    : PluginsListServer;

/**
 *
 * @param config конфигурация webpack
 * @param pluginName имя плагина
 * @returns плагин или плагины, которые подошли под условие из testRule
 */
export function findPlugin<Type extends 'client' | 'server'>() {
    return <PluginName extends keyof SelectedPluginsList<Type>>(
        config: rspack.Configuration | rspack.Configuration,
        pluginName: PluginName,
    ) => {
        if (!config.plugins || !pluginName) return [];

        const result: Array<SelectedPluginsList<Type>[PluginName]> = [];

        for (const plugin of config.plugins) {
            if (plugin?.constructor.name === pluginName) {
                result.push(plugin as any);
            }
        }

        return result;
    };
}
