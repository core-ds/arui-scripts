import { fetchAppManifest } from './utils/fetch-app-manifest';
import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
import { type ModuleResourcesGetter } from './create-module-loader';
import { type AruiAppManifest, type BaseModuleState, type ModuleResources } from './types';

type CreateClientResourcesFetcherParams = {
    baseUrl: string;
    assetsUrl?: string;
};

/**
 * Функция, которая создает метод для получения ресурсов модуля.
 * Предполагается, что она будет использоваться вместе с createModuleLoader.
 * @param baseUrl Базовый адрес приложения, которое предоставляет модули
 * @param assetsUrl Опциональный параметр для переопределения адреса манифеста
 */
export function createModuleFetcher({
    baseUrl,
    assetsUrl = '/assets/webpack-assets.json',
}: CreateClientResourcesFetcherParams): ModuleResourcesGetter<void, BaseModuleState> {
    const manifestUrl = `${urlSegmentWithoutEndSlash(baseUrl)}${assetsUrl}`;

    function getModuleFiles(manifest: AruiAppManifest, moduleId: string) {
        if (!manifest[moduleId]) {
            throw new Error(`Module ${moduleId} not found in manifest from ${manifestUrl}`);
        }

        const moduleFiles = manifest[moduleId];
        const moduleVendorFiles = manifest[`vendor-${moduleId}`] || {};

        // js/css в манифесте могут быть строкой или массивом, нормализуем в плоский список.
        const toArray = (value: string | string[] | undefined): string[] => {
            if (!value) return [];

            return Array.isArray(value) ? value : [value];
        };

        return {
            scripts: [...toArray(moduleFiles.js), ...toArray(moduleVendorFiles.js)],
            styles: [...toArray(moduleFiles.css), ...toArray(moduleVendorFiles.css)],
            mode: moduleFiles.mode || 'compat',
        };
    }

    return async function getClientModuleResources({
        moduleId,
        hostAppId,
    }): Promise<ModuleResources> {
        const manifest = await fetchAppManifest(manifestUrl);
        const { mode, ...moduleFiles } = getModuleFiles(manifest, moduleId);

        return {
            ...moduleFiles,
            /* eslint-disable no-underscore-dangle */
            moduleVersion: manifest.__metadata__.version || 'unknown',
            appName: manifest.__metadata__.name,
            /* eslint-enable no-underscore-dangle */
            mountMode: mode,
            moduleState: {
                baseUrl,
                hostAppId,
            },
        };
    };
}
