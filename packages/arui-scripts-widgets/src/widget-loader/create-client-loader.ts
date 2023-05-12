import { createLoader } from './create-loader';
import { CreateLoaderParams, GetResourcesRequest, GetResourcesResponse } from './types';
import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';

export type CreateClientLoaderParams<
    ResourcesRequest extends GetResourcesRequest,
    ResourcesResponse extends GetResourcesResponse,
> = Omit<CreateLoaderParams<ResourcesRequest, ResourcesResponse>, 'fetchFunction' | 'hostAppId'> & {
    baseUrl: string;
    mountMode?: 'legacy' | 'mf';
};


type ClientLoaderParams = {
    baseUrl: string;
    mountMode: 'mf';
}

async function fetchAppManifest(baseUrl: string) {
    const fetchResult = await fetch(
        `${urlSegmentWithoutEndSlash(baseUrl)}/assets/webpack-assets.json`,
        { cache: 'no-cache' },
    );
    return fetchResult.json();
}

export function createClientLoader<
    ResourcesRequest extends GetResourcesRequest, ResourcesResponse extends GetResourcesResponse,
>(
    {
        mountMode = 'legacy',
        ...loaderParams
    }: CreateClientLoaderParams<ResourcesRequest, ResourcesResponse>,
) {
    const fetchFunction = async (params: ResourcesRequest) => {
        const manifest = await fetchAppManifest(loaderParams.baseUrl);

        if (!manifest[params.moduleId]) {
            throw new Error(`Module ${params.moduleId} not found in manifest`);
        }

        const moduleFiles = manifest[params.moduleId];
        const moduleVendorFiles = manifest[`vendor-${params.moduleId}`] || {};

        return {
            scripts: [moduleFiles.js, moduleVendorFiles.js].filter(Boolean),
            styles: [moduleFiles.css, moduleVendorFiles.css].filter(Boolean),
            mountFunctionName: `__mount${params.moduleId}`,
            unmountFunctionName: `__unmount${params.moduleId}`,
            mountMode: "legacy",
            moduleRunParams: {
                contextRoot: loaderParams.baseUrl,
            },
            moduleVersion: manifest.__metadata__.version || 'unknown',
        } as ResourcesResponse;
    }

    const mfFetchFunction = async (params: ResourcesRequest) => {
        const manifest = await fetchAppManifest(loaderParams.baseUrl);

        return {
            scripts: ['assets/remoteEntry.js'],
            styles: [] as string[],
            mountFunctionName: `__mount${params.moduleId}`,
            unmountFunctionName: `__unmount${params.moduleId}`,
            mountMode: "mf",
            moduleRunParams: {
                contextRoot: loaderParams.baseUrl,
            },
            moduleVersion: manifest.__metadata__.version || 'unknown',
        } as ResourcesResponse;
    }
    return createLoader({
        ...loaderParams,
        fetchFunction: mountMode === 'mf' ? mfFetchFunction : fetchFunction,
        hostAppId: 'unknown' // this one is completely pointless when fetching client-side modules
    });
}
