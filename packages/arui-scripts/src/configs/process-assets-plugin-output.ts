import path from 'path';

import { type Assets } from 'assets-webpack-plugin';

import { configs } from './app-configs';
import { getSharedRequirements, MODULES_ENTRY_NAME } from './modules';

export function processAssetsPluginOutput(assets: Assets) {
    const adjustedAssets = assets;

    Object.keys(adjustedAssets).forEach((key) => {
        // заменяем путь к файлам на корректный в случае если в нем есть 'auto/'
        adjustedAssets[key] = {
            css: replaceAutoPath(adjustedAssets[key].css) as string,
            js: replaceAutoPath(adjustedAssets[key].js) as string,
        };
    });

    // добавляем в манифест js-файлы для модулей
    Object.keys(configs.modules?.exposes || {}).forEach((moduleName) => {
        if (configs.compatModules?.exposes?.[moduleName]) {
            throw new Error(
                `Модуль ${moduleName} определен как module и как compat. Поменяйте название одного из модулей или удалите его`,
            );
        }
        adjustedAssets[moduleName] = {
            mode: 'default',
            js: path.join(configs.publicPath, MODULES_ENTRY_NAME),
        };
    });

    const result = {
        ...adjustedAssets,
        __metadata__: {
            version: configs.version,
            name: configs.normalizedName,
            /**
             * Требования провайдера к общим библиотекам.
             *
             * В рантайме их не достать: они запечены в consume-shared код провайдера,
             * а сам провайдер никакого кода диагностики не выполняет - его модули грузит
             * загрузчик хоста. Манифест же хост скачивает и так, поэтому требования едут
             * вместе с ним: без них расхождение «хост просит ^18, провайдер просит ^17»
             * не видно ничем, а провайдер тем временем молча получает свою копию.
             */
            sharedRequirements: getSharedRequirements(
                configs.modules?.options?.separateBuildShared || configs.modules?.shared,
            ),
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
