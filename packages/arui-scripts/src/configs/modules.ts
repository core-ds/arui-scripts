// TODO: remove eslint-disable
/* eslint-disable no-param-reassign */
import rspack from '@rspack/core'

import { postCssPrefix } from '../plugins/postcss-prefix-selector';

import { CompatModuleConfig } from './app-configs/types';
import { findLoader } from './util/find-loader';
import configs from './app-configs';

export function haveExposedDefaultModules() {
    return configs.modules?.exposes;
}

export const MODULES_ENTRY_NAME = 'remoteEntry.js';

export function patchMainWebpackConfigForModules(webpackConf: rspack.Configuration) {
    // Добавляем expose loader для библиотек, которые мы хотим вынести в глобальную область видимости
    webpackConf.module!.rules!.unshift(...getExposeLoadersFormCompatModules());

    if (!configs.modules || !webpackConf.output || !webpackConf.plugins) {
        return webpackConf;
    }

    const {cssPrefix} = configs.modules.options || {};

    if (cssPrefix) {
        addCssPrefix(webpackConf, cssPrefix);
    }

    webpackConf.output.publicPath = haveExposedDefaultModules()
        ? 'auto' // Для того чтобы модули могли подключаться из разных мест, нам необходимо использовать auto. Для корректной работы в IE надо подключaть https://github.com/amiller-gh/currentScript-polyfill
        : configs.publicPath;

    webpackConf.plugins!.push(
        new rspack.container.ModuleFederationPlugin({
            name: configs.modules.name || configs.normalizedName,
            filename: configs.modules.exposes ? MODULES_ENTRY_NAME : undefined,
            shared: configs.modules.shared,
            exposes: configs.modules.exposes,
        }),
    );

    return webpackConf;
}

export function getCssPrefixForModule(module: CompatModuleConfig) {
    if (module.cssPrefix) {
        return module.cssPrefix;
    }
    if (module.cssPrefix === false) {
        return undefined;
    }

    return `.module-${module.name}`;
}

export function getExposeLoadersFormCompatModules() {
    const shared = configs.compatModules?.shared;

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

function addCssPrefix(webpackConf: rspack.Configuration, cssPrefix: string){
    const cssRule = findLoader(webpackConf, '/\\.css$/');
    const cssModulesRule = findLoader(webpackConf, '/\\.module\\.css$/');

    addPrefixCssRule(cssRule, cssPrefix);
    addPrefixCssRule(cssModulesRule, `:global(${cssPrefix})`);
}

function addPrefixCssRule(rule: rspack.RuleSetRule | undefined, prefix: string) {
    if (!rule || !rule.use || !Array.isArray(rule.use)) {
        return;
    }
    const postCssLoader = rule.use.find((loaderConfig) => {
        if (
            typeof loaderConfig === 'string' ||
            typeof loaderConfig === 'function' ||
            !loaderConfig
        ) {
            return false;
        }

        return loaderConfig.loader?.indexOf('postcss-loader') !== -1;
    });

    if (
        !postCssLoader ||
        typeof postCssLoader !== 'object' ||
        !postCssLoader.options ||
        typeof postCssLoader.options !== 'object'
    ) {
        return;
    }

    postCssLoader.options.postcssOptions.plugins = [
        ...postCssLoader.options.postcssOptions.plugins,
        postCssPrefix({ prefix: `${prefix} ` }),
    ];
}

export function patchWebpackConfigForCompat(
    module: CompatModuleConfig,
    webpackConf: rspack.Configuration,
) {
    webpackConf.externals = {
        ...((webpackConf.externals as Record<string, any>) || {}),
        ...(module.externals || {}),
    };
    // Название переменной вебпака, которую он будет использовать для загрузки чанков. Важно чтобы для разных модулей они отличались,
    // иначе несколько модулей из одного приложения будут конфликтовать между собой
    const uniqueName = module.name;

    // Для того чтобы модули могли подключаться из разных мест, нам необходимо использовать publicPath = auto. Для корректной работы в IE надо подключaть https://github.com/amiller-gh/currentScript-polyfill
    webpackConf.output = { ...webpackConf.output, publicPath: 'auto', uniqueName };

    const cssPrefix = getCssPrefixForModule(module);

    if (cssPrefix) {
        addCssPrefix(webpackConf, cssPrefix);
    }

    return webpackConf;
}
