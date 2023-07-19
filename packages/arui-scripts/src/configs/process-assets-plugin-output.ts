import path from 'path';
import { Assets } from 'assets-webpack-plugin';
import configs from './app-configs';
import { MF_ENTRY_NAME } from './modules';

export function processAssetsPluginOutput(assets: Assets) {
    let adjustedAssets = assets;

    Object.keys(adjustedAssets).forEach((key) => {
        // заменяем путь к файлам на корректный в случае если в нем есть 'auto/'
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

    const result = {
        ...adjustedAssets,
        __metadata__: {
            version: configs.version,
            name: configs.normalizedName,
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
