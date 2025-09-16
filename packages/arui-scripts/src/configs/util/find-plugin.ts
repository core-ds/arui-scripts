import { type Worker } from 'cluster';

import { type ReactRefreshPluginOptions } from '@pmmmwh/react-refresh-webpack-plugin/types/lib/types';
import {
    type Configuration,
    type CssExtractRspackPluginOptions,
    type DefinePlugin,
    type NormalModuleReplacementPlugin,
} from '@rspack/core';
import { type BannerPluginOptions } from '@rspack/core/dist/builtin-plugin/BannerPlugin';
import type AssetsPlugin from 'assets-webpack-plugin';
import type CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import type CompressionPlugin from 'compression-webpack-plugin';
import { type ForkTsCheckerWebpackPluginOptions } from 'fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions';
import type MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { type RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import { type WebpackDeduplicationPlugin } from 'webpack-deduplication-plugin';
import { type WebpackManifestPlugin } from 'webpack-manifest-plugin';

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
        definitions: ConstructorParameters<typeof DefinePlugin>[number];
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
    NormalModuleReplacementPlugin: NormalModuleReplacementPlugin;
};

/*
    вариации плагинов сервера
    сюда не попали:
        1. HotModuleReplacementPlugin
        2. NoEmitOnErrorsPlugin
 */
type PluginsListServer = {
    BannerPlugin: {
        options: BannerPluginOptions;
    };
    RunScriptWebpackPlugin: {
        options: ConstructorParameters<typeof RunScriptWebpackPlugin>[number];
    };
    ReloadServerPlugin: {
        done: (...props: unknown[]) => unknown | null;
        workers: Worker[];
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
        config: Configuration,
        pluginName: PluginName,
    ) => {
        if (!config.plugins || !pluginName) return [];

        const result: Array<SelectedPluginsList<Type>[PluginName]> = [];

        for (const plugin of config.plugins) {
            if (plugin?.constructor.name === pluginName) {
                result.push(plugin as SelectedPluginsList<Type>[PluginName]);
            }
        }

        return result;
    };
}
