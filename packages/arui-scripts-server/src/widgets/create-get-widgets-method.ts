import type { GetResourcesRequest, GetResourcesResponse } from '@arui-scripts/widgets';
import { readAssetsManifest } from '../read-assets-manifest';
import { WidgetsConfig } from './types';

export function createGetWidgetsMethod(widgets: WidgetsConfig) {
    const assets: Record<string, Awaited<ReturnType<typeof readAssetsManifest>>> = {};

    return {
        method: 'POST',
        path: '/api/getModuleResources',
        handler: async (getResourcesRequest: GetResourcesRequest, frameworkRequest: unknown): Promise<GetResourcesResponse> => {
            const moduleName = getResourcesRequest.moduleId;

            if (!widgets[moduleName]) {
                throw new Error(`Widget ${moduleName} not found`);
            }

            const widget = widgets[moduleName];

            if (widget.mountMode === 'legacy' && !assets[moduleName]) {
                assets[moduleName] = await readAssetsManifest([`vendor-${moduleName}`, moduleName]);
            }
            if (widget.mountMode === 'mf') {
                // для mf модулей мы всегда берем просто remoteEntry, это стандартный энтрипоинт для mf
                // загрузку стилей при этом на себя берет сам mf.
                assets[moduleName] = {
                    js: ['assets/remoteEntry.js'],
                    css: [],
                }
            }

            const moduleAssets = assets[moduleName];

            const moduleRunParams = await widget.getRunParams(
                getResourcesRequest,
                frameworkRequest
            );

            return {
                mountMode: widget.mountMode,
                moduleVersion: widget.version ?? 'unknown',
                mountFunctionName: widget.mountMode === 'mf' ? 'mount' : widget.mountFunctionName,
                unmountFunctionName: widget.mountMode === 'mf' ? 'unmount' : widget.unmountFunctionName,
                scripts: moduleAssets.js,
                styles: moduleAssets.css,
                moduleRunParams,
            };
        }
    }
}
