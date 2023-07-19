import webpack from 'webpack';
import cssPrefix from 'postcss-prefix-selector';
import configs from './app-configs';
import { EmbeddedModuleConfig } from './app-configs/types';
import {findLoader} from "./util/find-loader";

export function haveExposedMfModules() {
    return configs.mfModules?.exposes;
}

export const MF_ENTRY_NAME = 'remoteEntry.js';

export function patchMainWebpackConfigForModules(webpackConf: webpack.Configuration) {
    // Добавляем expose loader для библиотек, которые мы хотим вынести в глобальную область видимости
    webpackConf.module!.rules!.unshift(...getExposeLoadersFormEmbeddedModules());

    if (!configs.mfModules || !webpackConf.output || !webpackConf.plugins) {
        return webpackConf;
    }

    webpackConf.output.publicPath = haveExposedMfModules()
        ? 'auto' // Для того чтобы модули могли подключаться из разных мест, нам необходимо использовать auto. Для корректной работы в IE надо подключaть https://github.com/amiller-gh/currentScript-polyfill
        : configs.publicPath;

    webpackConf.plugins!.push(
        new webpack.container.ModuleFederationPlugin({
            name: configs.mfModules.name || configs.normalizedName,
            filename: configs.mfModules.exposes ? MF_ENTRY_NAME : undefined,
            shared: configs.mfModules.shared,
            exposes: configs.mfModules.exposes,
        }),
    );

    return webpackConf;
}

export function getCssPrefixForModule(module: EmbeddedModuleConfig) {
    if (module.cssPrefix) {
        return module.cssPrefix;
    }
    if (module.cssPrefix === false) {
        return undefined;
    }
    return `.module-${module.name}`;
}

export function getExposeLoadersFormEmbeddedModules() {
    const shared = configs.embeddedModules?.shared;
    if (!shared) {
        return [];
    }

    return Object.keys(shared).map((libraryName) => {
        const globalVarName = shared[libraryName];
        return {
            test: require.resolve(libraryName),
            use: [
                {
                    loader: require.resolve('expose-loader'),
                    options: {
                        exposes: [globalVarName],
                    },
                },
            ],
        };
    });
}

function addPrefixCssRule(rule: webpack.RuleSetRule | undefined, prefix: string) {
    if (!rule || !rule.use || !Array.isArray(rule.use)) {
        return;
    }
    const postCssLoader = rule.use.find((loaderConfig) => {
        if (typeof loaderConfig === 'string' || typeof loaderConfig === 'function' || !loaderConfig) {
            return false;
        }
        return loaderConfig.loader?.indexOf('postcss-loader') !== -1
    });

    if (!postCssLoader || typeof postCssLoader !== 'object' || !postCssLoader.options || typeof postCssLoader.options !== 'object') {
        return;
    }

    postCssLoader.options.postcssOptions.plugins = [
        ...postCssLoader.options.postcssOptions.plugins,
        cssPrefix({ prefix }),
    ];
}

export function patchWebpackConfigForEmbedded(module: EmbeddedModuleConfig, webpackConf: webpack.Configuration) {
    webpackConf.externals = {
        ...(webpackConf.externals as Record<string, any> || {}),
        ...(module.embeddedConfig || {})
    };
    // Название переменной вебпака, которую он будет использовать для загрузки чанков. Важно чтобы для разных модулей они отличались,
    // иначе несколько модулей из одного приложения будут конфликтовать между собой
    webpackConf.output!.uniqueName = module.name;

    const cssPrefix = getCssPrefixForModule(module);
    if (cssPrefix) {
        // Добавляем префикс для css-классов, чтобы изолировать стили модуля от стилей основного приложения
        const cssRule = findLoader(webpackConf, '/\\.css$/');
        const cssModulesRule = findLoader(webpackConf, '/\\.module\\.css$/');
        addPrefixCssRule(cssRule, cssPrefix);
        addPrefixCssRule(cssModulesRule, `:global(${cssPrefix})`);
    }

    return webpackConf;
}
