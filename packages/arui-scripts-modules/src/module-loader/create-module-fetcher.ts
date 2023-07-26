import { AruiAppManifest, BaseModuleState, ModuleResources, MountMode } from './types';
import { fetchAppManifest } from './utils/fetch-app-manifest';
import { ModuleResourcesGetter } from './create-module-loader';
import {urlSegmentWithoutEndSlash} from "./utils/normalize-url-segment";

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

        return {
            scripts: [moduleFiles.js, moduleVendorFiles.js].filter(Boolean) as string[],
            styles: [moduleFiles.css, moduleVendorFiles.css].filter(Boolean) as string[],
            mode: moduleFiles.mode || 'compat',
        };
    }


    return async function getClientModuleResources({ moduleId }): Promise<ModuleResources> {
        const manifest = await fetchAppManifest(manifestUrl);
        const { mode, ...moduleFiles} = getModuleFiles(manifest, moduleId);

        return {
            ...moduleFiles,
            moduleVersion: manifest.__metadata__.version || 'unknown',
            appName: manifest.__metadata__.name,
            mountMode: mode,
            moduleState: {
                baseUrl,
            },
        }
    }
}
