import { ModuleResourcesGetter } from './create-module-loader';
import { AruiAppManifest, BaseModuleState } from './types';
import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
import { getServerFetcherParams } from './get-server-fetcher-params';

type CreateServerResourcesFetcherParams = {
    baseUrl: string;
    headers?: Record<string, string>;
}
export function createServerResourcesFetcher<GetResourcesParams = undefined>({
    baseUrl,
    headers = {},
}: CreateServerResourcesFetcherParams): ModuleResourcesGetter<GetResourcesParams, BaseModuleState> {
    return async function fetchServerResources(params) {
        const { relativePath, method } = getServerFetcherParams();
        const url = `${urlSegmentWithoutEndSlash(baseUrl)}${relativePath}`;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            Object.keys(headers).forEach((headerName) => {
                xhr.setRequestHeader(headerName, headers[headerName]);
            });
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.statusText));
                }
            };
            xhr.onerror = () => reject(new Error(xhr.statusText));
            xhr.send(JSON.stringify(params));
        });
    };
}
