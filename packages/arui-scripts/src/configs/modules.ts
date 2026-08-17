import * as rspack from '@rspack/core';

import { postCssPrefix } from '../plugins/postcss-prefix-selector';
import { TurnOffSplitRemoteEntry } from '../plugins/turn-off-split-remote-entry';

import { type CompatModuleConfig } from './app-configs/types';
import { findLoader } from './util/find-loader';
import { configs } from './app-configs';

export function haveExposedDefaultModules() {
    return configs.modules?.exposes;
}

export const MODULES_ENTRY_NAME = 'remoteEntry.js';
export const MODULES_SEPARATE_BUILD_NAME = 'wmf';

function getModuleFederationContainerName() {
    return configs.modules?.name || configs.normalizedName;
}

function getSeparateBuildRuntimeName() {
    return `${getModuleFederationContainerName().replace(
        /\W/g,
        '_',
    )}_${MODULES_SEPARATE_BUILD_NAME}`;
}

/**
 * Свободная переменная с объявленными требованиями к общим библиотекам.
 *
 * Читает её `@alfalab/scripts-modules` и кладёт в контракт диагностики, откуда их забирает
 * расширение отладки: сама по себе эта информация в рантайме не сохраняется нигде.
 */
export const SHARED_REQUIREMENTS_VARIABLE = '__ARUI_MODULES_SHARED_REQUIREMENTS__';

type SharedConfig = NonNullable<
    ConstructorParameters<typeof rspack.container.ModuleFederationPlugin>[0]['shared']
>;

/**
 * Приводит `shared` к плоскому виду `{ пакет: { requiredVersion, singleton, ... } }`.
 *
 * Записать его можно тремя способами - массивом имён, объектом с версией строкой или объектом
 * с конфигом, - а читателю нужен один.
 */
export function getSharedRequirements(shared: SharedConfig | undefined) {
    const result: Record<
        string,
        { requiredVersion?: string; singleton?: boolean; strictVersion?: boolean; eager?: boolean }
    > = {};

    if (!shared) {
        return result;
    }

    const entries = Array.isArray(shared)
        ? shared.map((item) => (typeof item === 'string' ? [item, {}] : Object.entries(item)[0]))
        : Object.entries(shared);

    entries.forEach((entry) => {
        if (!entry) {
            return;
        }

        const [name, value] = entry as [string, unknown];

        if (typeof value === 'string') {
            result[name] = { requiredVersion: value };

            return;
        }

        if (typeof value === 'object' && value !== null) {
            const config = value as {
                requiredVersion?: unknown;
                singleton?: unknown;
                strictVersion?: unknown;
                eager?: unknown;
            };

            result[name] = {
                requiredVersion:
                    typeof config.requiredVersion === 'string' ? config.requiredVersion : undefined,
                singleton: typeof config.singleton === 'boolean' ? config.singleton : undefined,
                strictVersion:
                    typeof config.strictVersion === 'boolean' ? config.strictVersion : undefined,
                eager: typeof config.eager === 'boolean' ? config.eager : undefined,
            };

            return;
        }

        result[name] = {};
    });

    return result;
}

export function patchMainRspackConfigForModules(
    webpackConf: rspack.Configuration,
    mode: 'consumer' | 'provider' | 'both',
) {
    /* eslint-disable no-param-reassign */
    const isConsumer = mode === 'consumer' || mode === 'both';
    const isProvider = mode === 'provider' || mode === 'both';

    if (configs.disableModulesSupport) {
        // проект хочет сам разбираться с WMF и прочими вещами, полностью отключаем обработку модулей на своей стороне
        return webpackConf;
    }
    if (!webpackConf.module?.rules || !webpackConf.plugins) {
        // делаем TS счастливым, на самом деле module и plugins у нас будут всегда
        return webpackConf;
    }

    if (isConsumer) {
        // Добавляем expose loader для библиотек, которые мы хотим вынести в глобальную область видимости
        webpackConf.module.rules.unshift(...getExposeLoadersFormCompatModules());
    }

    if (!configs.modules || !webpackConf.output || !webpackConf.plugins) {
        if (isConsumer) {
            // webpack по умолчанию всегда добавлял runtime для шаринга, даже когда модули не включены.
            // Rspack этого больше не делает, поэтому добавляем плагин для рантайма самостоятельно
            webpackConf.plugins.push(new rspack.sharing.ProvideSharedPlugin({ provides: {} }));
        }

        return webpackConf;
    }

    const { cssPrefix } = configs.modules.options || {};

    if (cssPrefix && isProvider) {
        addCssPrefix(webpackConf, cssPrefix);
    }

    webpackConf.output.publicPath = haveExposedDefaultModules()
        ? 'auto' // Для того чтобы модули могли подключаться из разных мест, нам необходимо использовать auto. Для корректной работы в IE надо подключaть https://github.com/amiller-gh/currentScript-polyfill
        : configs.publicPath;

    if (mode === 'provider') {
        const uniqueName = getSeparateBuildRuntimeName();

        webpackConf.output = {
            ...webpackConf.output,
            uniqueName,
            chunkLoadingGlobal: `rspackChunk${uniqueName}`,
        };
    }

    const shared =
        (mode === 'provider' && configs.modules.options?.separateBuildShared) ||
        configs.modules.shared;

    webpackConf.plugins.push(
        new rspack.container.ModuleFederationPlugin({
            name: getModuleFederationContainerName(),
            filename: isProvider && configs.modules.exposes ? MODULES_ENTRY_NAME : undefined,
            shared,
            exposes: isProvider ? configs.modules.exposes : {},
            shareScope: configs.modules.shareScope,
        }),
        new TurnOffSplitRemoteEntry(getModuleFederationContainerName()),
        // Объявленные требования к общим библиотекам известны только здесь, на сборке:
        // в рантайме share scope хранит лишь то, что в него положили, а требования
        // потребителей живут в сгенерированном коде consume-shared модулей.
        // Без них расхождение «хост просит ^18, провайдер просит ^17» не видно ничем.
        new rspack.DefinePlugin({
            [SHARED_REQUIREMENTS_VARIABLE]: JSON.stringify(getSharedRequirements(shared)),
        }),
    );

    return webpackConf;
    /* eslint-enable no-param-reassign */
}

/** @deprecated используйте `patchMainRspackConfigForModules` */
export const patchMainWebpackConfigForModules = patchMainRspackConfigForModules;

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

function addCssPrefix(webpackConf: rspack.Configuration, cssPrefix: string) {
    const cssRule = findLoader(webpackConf, '/\\.css$/');
    const cssModulesRule = findLoader(webpackConf, '/\\.module\\.css$/');

    addPrefixCssRule(cssRule, cssPrefix);
    addPrefixCssRule(cssModulesRule, `:global(${cssPrefix})`);
}

function addPrefixCssRule(rule: rspack.RuleSetRule | undefined, prefix: string) {
    if (!rule?.use || !Array.isArray(rule.use)) {
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
    /* eslint-disable no-param-reassign */
    webpackConf.externals = {
        ...((webpackConf.externals as Record<string, string>) || {}),
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
    /* eslint-enable no-param-reassign */
}
