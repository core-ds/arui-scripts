import { Assets } from 'assets-webpack-plugin';
import configs from './app-configs';

export function processAssetsPluginOutput(assets: Assets) {
    let adjustedAssets = assets;

    Object.keys(adjustedAssets).forEach((key) => {
        // заменяем путь к файлам на корректный в случае если в нем есть 'auto/'
        adjustedAssets[key] = {
            css: replaceAutoPath(adjustedAssets[key].css) as any,
            js: replaceAutoPath(adjustedAssets[key].js) as any,
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
