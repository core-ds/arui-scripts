import type { GetResourcesRequest, GetResourcesResponse } from '@arui-scripts/modules';
import { readAssetsManifest, getAppManifest } from '../read-assets-manifest';
import { ModulesConfig } from './types';

export function createGetModulesMethod<FrameworkParams extends unknown[] = []>(
    modules: ModulesConfig<FrameworkParams>,
) {
    const assets: Record<string, Awaited<ReturnType<typeof readAssetsManifest>>> = {};

    return {
        method: 'POST',
        path: '/api/getModuleResources',
        handler: async (getResourcesRequest: GetResourcesRequest, ...params: FrameworkParams): Promise<GetResourcesResponse> => {
            const appManifest = await getAppManifest();
            const moduleName = getResourcesRequest.moduleId;

            if (!modules[moduleName]) {
                throw new Error(`Module ${moduleName} not found`);
            }

            const module = modules[moduleName];

            if (module.mountMode === 'embedded' && !assets[moduleName]) {
                assets[moduleName] = await readAssetsManifest([`vendor-${moduleName}`, moduleName]);
            }
            if (module.mountMode === 'mf') {
                // для mf модулей мы всегда берем просто remoteEntry, это стандартный энтрипоинт для mf
                // загрузку стилей при этом на себя берет сам mf.
                assets[moduleName] = {
                    js: ['assets/remoteEntry.js'],
                    css: [],
                }
            }

            const moduleAssets = assets[moduleName];

            const moduleRunParams = await module.getRunParams(
                getResourcesRequest,
                ...params,
            );

            return {
                mountMode: module.mountMode,
                moduleVersion: module.version ?? 'unknown',
                scripts: moduleAssets.js,
                styles: moduleAssets.css,
                moduleRunParams,
                appName: appManifest.__metadata__.name,
            };
        }
    }
}
