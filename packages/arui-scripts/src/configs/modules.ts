import path from "path";
import { Assets } from 'assets-webpack-plugin';
import configs from './app-configs';
import { EmbeddedModuleConfig } from './app-configs/types';

export function processAssetsPluginOutput(assets: Assets) {
    let adjustedAssets = assets;
    if (haveExposedMfModules()) { // для mf модулей мы делаем publicPath 'auto', но в самом манифесте нам все равно хочется видеть нормальный путь
        Object.keys(adjustedAssets).forEach((key) => {
            adjustedAssets[key] = {
                css: replaceAutoPath(adjustedAssets[key].css) as any,
                js: replaceAutoPath(adjustedAssets[key].js) as any,
            };
        });

        // добавляем в манифест js-файлы для mf модулей
        Object.keys(configs.mfModules?.exposes || {}).forEach((moduleName) => {
            if (configs.embeddedModules?.exposes?.[moduleName]) {
                throw new Error(`Модуль ${moduleName} определен как mf и как embedded. Поменяйте название одного из модулей или удалите его`);
            }
            adjustedAssets[moduleName] = {
                mode: 'mf',
                js: path.join(configs.publicPath, MF_ENTRY_NAME),
            };
        });
    }

    const result = {
        ...adjustedAssets,
        __metadata__: {
            version: configs.version,
            name: configs.mfModules?.name || configs.normalizedName,
        },
    };

    return JSON.stringify(result);
}

function replaceAutoPath(assets: string | string[] | undefined) {
    if (!assets) {
        return assets;
    }
    if (Array.isArray(assets)) {
        return assets.map((asset) => asset.replace(/^auto\//, configs.publicPath));
    }
    return assets.replace(/^auto\//, configs.publicPath);
}

export function haveExposedMfModules() {
    return configs.mfModules?.exposes;
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

export function getChunkNamePrefix(module?: EmbeddedModuleConfig) {
    if (!module) {
        return '';
    }
    return `${module.name}-`;
}

export function getExposeLoadersFormEmbeddedModules(module?: EmbeddedModuleConfig) {
    const shared = configs.embeddedModules?.shared;
    if (!shared || module) {
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

export const MF_ENTRY_NAME = 'remoteEntry.js';
