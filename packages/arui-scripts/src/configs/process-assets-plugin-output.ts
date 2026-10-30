import path from 'path';

import { type Assets } from 'assets-webpack-plugin';

import { type ChunkGroupFiles } from '../plugins/async-chunk-groups';

import { configs } from './app-configs';
import { asyncChunkGroupsManifest } from './async-chunk-groups-manifest';
import { MODULES_ENTRY_NAME } from './modules';
import { modulesCssManifest } from './modules-css-manifest';

export function processAssetsPluginOutput(assets: Assets) {
    const adjustedAssets = assets;

    Object.keys(adjustedAssets).forEach((key) => {
        // заменяем путь к файлам на корректный в случае если в нем есть 'auto/'
        adjustedAssets[key] = {
            css: replaceAutoPath(adjustedAssets[key].css) as string,
            js: replaceAutoPath(adjustedAssets[key].js) as string,
        };
    });

    // Подменяем записи async чанк-групп на полные списки файлов: в записи AssetsPlugin только
    // собственные файлы чанка, а общие чанки splitChunks лежат в безымянной ("") записи.
    asyncChunkGroupsManifest.forEach((groupFiles, groupName) => {
        adjustedAssets[groupName] = toManifestEntry(groupFiles) as unknown as Assets[string];
    });

    // добавляем в манифест js-файлы для модулей
    Object.keys(configs.modules?.exposes || {}).forEach((moduleName) => {
        if (configs.compatModules?.exposes?.[moduleName]) {
            throw new Error(
                `Модуль ${moduleName} определен как module и как compat. Поменяйте название одного из модулей или удалите его`,
            );
        }
        // css собирает AttributeModuleCssPlugin (обход графа чанков).
        // Пути в манифесте держим с publicPath, как и remoteEntry.js.
        const moduleCss = modulesCssManifest.get(moduleName);

        // css здесь массив (per-expose может быть несколько css-чанков), что шире
        // строкового индекса типа Assets, но манифест сериализуется в json, а читатели
        // (AruiAppManifest, createGetModulesMethod) уже принимают string | string[].
        adjustedAssets[moduleName] = {
            mode: 'default',
            js: path.join(configs.publicPath, MODULES_ENTRY_NAME),
            ...(moduleCss && moduleCss.length > 0
                ? { css: moduleCss.map((file) => path.join(configs.publicPath, file)) }
                : {}),
        } as unknown as Assets[string];
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

function toManifestEntry({ js, css, publicPath }: ChunkGroupFiles) {
    // Для auto сохраняем тот же серверный путь, что и в записях AssetsPlugin.
    const prefix = publicPath === 'auto' ? configs.publicPath : publicPath;
    const assetPath = prefix && !prefix.endsWith('/') ? `${prefix}/` : prefix;
    const withPublicPath = (file: string) => `${assetPath}${file}`;

    return {
        ...(js.length > 0 ? { js: js.map(withPublicPath) } : {}),
        ...(css.length > 0 ? { css: css.map(withPublicPath) } : {}),
    };
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
