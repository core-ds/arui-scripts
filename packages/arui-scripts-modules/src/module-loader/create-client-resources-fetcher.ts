import { AruiAppManifest, BaseModuleState, ModuleResources, MountMode } from './types';
import { fetchAppManifest } from './utils/fetch-app-manifest';
import { ModuleResourcesGetter } from './create-module-loader';

type CreateClientResourcesFetcherParams = {
    baseUrl: string;
    mountMode: MountMode;
};

/**
 * Функция, которая создает метод для получения ресурсов клиентского модуля.
 * Предполагается, что она будет использоваться вместе с createModuleLoader.
 * @param baseUrl Базовый адрес приложения, которое предоставляет модули
 * @param mountMode то, как подключать модуль на страницу
 */
export function createClientResourcesFetcher({
    baseUrl,
    mountMode,
}: CreateClientResourcesFetcherParams): ModuleResourcesGetter<void, BaseModuleState> {
    function getModuleFiles(manifest: AruiAppManifest, moduleId: string) {
        if (mountMode === 'mf') {
            return {
                scripts: ['assets/remoteEntry.js'],
                styles: [] as string[],
            };
        }

        if (!manifest[moduleId]) {
            throw new Error(`Module ${moduleId} not found in manifest`);
        }

        const moduleFiles = manifest[moduleId];
        const moduleVendorFiles = manifest[`vendor-${moduleId}`] || {};

        return {
            scripts: [moduleFiles.js, moduleVendorFiles.js].filter(Boolean) as string[],
            styles: [moduleFiles.css, moduleVendorFiles.css].filter(Boolean) as string[],
        };
    }


    return async function getClientModuleResources({ moduleId }): Promise<ModuleResources> {
        const manifest = await fetchAppManifest(baseUrl);
        const moduleFiles = getModuleFiles(manifest, moduleId);

        return {
            ...moduleFiles,
            moduleVersion: manifest.__metadata__.version || 'unknown',
            appName: manifest.__metadata__.name,
            mountMode,
            moduleState: {
                baseUrl,
            },
        }
    }
}
