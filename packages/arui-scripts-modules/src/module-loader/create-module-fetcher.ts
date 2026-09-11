import { fetchAppManifest } from './utils/fetch-app-manifest';
import { getLocalModuleOverride } from './utils/local-override';
import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
import { type ModuleResourcesGetter } from './create-module-loader';
import { type AruiAppManifest, type BaseModuleState, type ModuleResources } from './types';

type CreateClientResourcesFetcherParams = {
    baseUrl: string;
    assetsUrl?: string;
    /**
     * Разрешает переопределять базовый адрес приложения-источника модулей через localStorage
     * (см. LOCAL_OVERRIDE_STORAGE_KEY). По-умолчанию false.
     */
    allowLocalOverride?: boolean;
};

// js/css в манифесте могут быть строкой или массивом, нормализуем в плоский список.
function toArray(value: string | string[] | undefined): string[] {
    if (!value) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
}

/**
 * Функция, которая создает метод для получения ресурсов модуля.
 * Предполагается, что она будет использоваться вместе с createModuleLoader.
 * @param baseUrl Базовый адрес приложения, которое предоставляет модули
 * @param assetsUrl Опциональный параметр для переопределения адреса манифеста
 * @param allowLocalOverride Флаг, включающий локальный оверрайд адреса модуля через localStorage
 */
export function createModuleFetcher({
    baseUrl,
    assetsUrl = '/assets/webpack-assets.json',
    allowLocalOverride = false,
}: CreateClientResourcesFetcherParams): ModuleResourcesGetter<void, BaseModuleState> {
    function getModuleFiles(manifest: AruiAppManifest, moduleId: string, manifestUrl: string) {
        if (!manifest[moduleId]) {
            throw new Error(`Module ${moduleId} not found in manifest from ${manifestUrl}`);
        }

        const moduleFiles = manifest[moduleId];
        const moduleVendorFiles = manifest[`vendor-${moduleId}`] || {};

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
        const overrideBaseUrl = allowLocalOverride ? getLocalModuleOverride(moduleId) : undefined;
        const effectiveBaseUrl = overrideBaseUrl ?? baseUrl;
        const manifestUrl = `${urlSegmentWithoutEndSlash(effectiveBaseUrl)}${assetsUrl}`;
        const manifest = await fetchAppManifest(manifestUrl);
        const { mode, ...moduleFiles } = getModuleFiles(manifest, moduleId, manifestUrl);

        return {
            ...moduleFiles,
            /* eslint-disable no-underscore-dangle */
            moduleVersion: manifest.__metadata__.version || 'unknown',
            appName: manifest.__metadata__.name,
            /* eslint-enable no-underscore-dangle */
            mountMode: mode,
            moduleState: {
                baseUrl: effectiveBaseUrl,
                hostAppId,
            },
        };
    };
}
