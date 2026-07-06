import { type GetResourcesRequest, type ModuleResources } from '@alfalab/scripts-modules';

import { getAppManifest, readAssetsManifest } from '../read-assets-manifest';

import { type CreateGetModulesMethodOptions, type ModulesConfig } from './types';

export function createGetModulesMethod<
    FrameworkParams extends unknown[] = [],
    GetResourcesParams = void,
>(
    modules: ModulesConfig<FrameworkParams, GetResourcesParams>,
    { ssrErrorMode = 'fallback' }: CreateGetModulesMethodOptions = {},
) {
    const assets: Record<string, Awaited<ReturnType<typeof readAssetsManifest>>> = {};

    return {
        method: 'POST',
        path: '/api/getModuleResources',
        handler: async (
            getResourcesRequest: GetResourcesRequest<GetResourcesParams>,
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

            const moduleState = {
                ...moduleRunParams,
                hostAppId: getResourcesRequest.hostAppId,
            };

            let html: string | undefined;

            if (getResourcesRequest.ssr && module.renderToHtml) {
                try {
                    html = await module.renderToHtml(
                        {
                            moduleState,
                            ssrRunParams: getResourcesRequest.ssr.runParams,
                            getResourcesRequest,
                        },
                        ...params,
                    );
                } catch (error) {
                    if (ssrErrorMode === 'reject') {
                        throw error;
                    }

                    // eslint-disable-next-line no-console -- ошибка серверного рендера не должна ронять весь ответ
                    console.error(
                        `Ошибка серверного рендера модуля ${moduleName}, ответ будет отправлен без html`,
                        error,
                    );
                }
            }

            return {
                mountMode: module.mountMode,
                moduleVersion: module.version ?? 'unknown',
                scripts: moduleAssets.js,
                styles: moduleAssets.css,
                moduleState,
                // eslint-disable-next-line no-underscore-dangle
                appName: appManifest.__metadata__.name,
                ...(html === undefined ? {} : { html }),
            };
        },
    };
}
