import type { GetResourcesRequest, ModuleResources } from '@alfalab/scripts-modules';

import { getAppManifest, readAssetsManifest } from '../read-assets-manifest';

import { ModulesConfig } from './types';

export function createGetModulesMethod<FrameworkParams extends unknown[] = []>(
    modules: ModulesConfig<FrameworkParams>,
) {
    const assets: Record<string, Awaited<ReturnType<typeof readAssetsManifest>>> = {};

    return {
        method: 'POST',
        path: '/api/getModuleResources',
        handler: async (
            getResourcesRequest: GetResourcesRequest,
            ...params: FrameworkParams
        ): Promise<ModuleResources> => {
            const appManifest = await getAppManifest();
            const moduleName = getResourcesRequest.moduleId;

            if (!modules[moduleName]) {
                throw new Error(`Module ${moduleName} not found`);
            }

            const module = modules[moduleName];

            if (module.mountMode === 'compat' && !assets[moduleName]) {
                assets[moduleName] = await readAssetsManifest([`vendor-${moduleName}`, moduleName]);
            }
            if (module.mountMode === 'default') {
                // для default модулей мы всегда берем просто remoteEntry, это стандартный энтрипоинт для module federation
                // загрузку стилей при этом на себя берет сам module federation.
                assets[moduleName] = {
                    js: ['assets/remoteEntry.js'],
                    css: [],
                };
            }

            const moduleAssets = assets[moduleName];

            const moduleRunParams = await module.getModuleState(getResourcesRequest, ...params);

            return {
                mountMode: module.mountMode,
                moduleVersion: module.version ?? 'unknown',
                scripts: moduleAssets.js,
                styles: moduleAssets.css,
                moduleState: {
                    ...moduleRunParams,
                    hostAppId: getResourcesRequest.hostAppId,
                },
                appName: appManifest.__metadata__.name,
            };
        },
    };
}
