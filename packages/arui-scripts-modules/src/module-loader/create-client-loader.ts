import { createLoader } from './create-loader';
import { CreateLoaderParams, GetResourcesRequest, GetResourcesResponse, AruiAppManifest } from './types';
import { fetchAppManifest } from './fetch-app-manifest';

export type CreateClientLoaderParams<
    ResourcesRequest extends GetResourcesRequest,
    ResourcesResponse extends GetResourcesResponse,
> = Omit<CreateLoaderParams<ResourcesRequest, ResourcesResponse>, 'fetchFunction' | 'hostAppId'> & {
    baseUrl: string;
    mountMode?: 'embedded' | 'mf';
};


export function createClientLoader<
    ResourcesRequest extends GetResourcesRequest, ResourcesResponse extends GetResourcesResponse,
>(
    {
        mountMode = 'embedded',
        ...loaderParams
    }: CreateClientLoaderParams<ResourcesRequest, ResourcesResponse>,
) {
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
            scripts: [moduleFiles.js, moduleVendorFiles.js].filter(Boolean),
            styles: [moduleFiles.css, moduleVendorFiles.css].filter(Boolean),
        };
    }


    const fetchFunction = async (params: ResourcesRequest): Promise<ResourcesResponse> => {
        const manifest = await fetchAppManifest(loaderParams.baseUrl);

        return {
            ...getModuleFiles(manifest, params.moduleId),
            mountMode,
            moduleRunParams: {
                contextRoot: loaderParams.baseUrl,
            },
            appName: manifest.__metadata__.name,
            moduleVersion: manifest.__metadata__.version || 'unknown',
        } as ResourcesResponse;
    }

    return createLoader({
        ...loaderParams,
        fetchFunction,
        hostAppId: 'unknown' // this one is completely pointless when fetching client-side modules
    });
}
