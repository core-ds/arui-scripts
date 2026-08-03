import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
import { createNetworkError, createParseError, createResponseError } from './utils/request-error';
import { type ModuleResourcesGetter } from './create-module-loader';
import { getServerStateModuleFetcherParams } from './get-server-state-module-fetcher-params';
import { type BaseModuleState } from './types';

type CreateServerResourcesFetcherParams = {
    baseUrl: string;
    headers?: Record<string, string>;
};

/**
 * Функция, которая создает метод для получения ресурсов модуля с серверным состоянием
 * @param baseUrl
 * @param headers
 */
export function createServerStateModuleFetcher<GetResourcesParams = undefined>({
    baseUrl,
    headers = {},
}: CreateServerResourcesFetcherParams): ModuleResourcesGetter<GetResourcesParams, BaseModuleState> {
    return async function fetchServerResources(params) {
        const { relativePath, method } = getServerStateModuleFetcherParams();
        const url = `${urlSegmentWithoutEndSlash(baseUrl)}${relativePath}`;
        const errorDescription = `Module resources request for ${params.moduleId}`;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(method, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            Object.keys(headers).forEach((headerName) => {
                xhr.setRequestHeader(headerName, headers[headerName]);
            });
            xhr.onload = () => {
                if (xhr.status !== 200) {
                    reject(createResponseError(errorDescription, url, xhr));

                    return;
                }

                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch (error) {
                    reject(createParseError(errorDescription, url, error));
                }
            };
            xhr.onerror = () => reject(createNetworkError(errorDescription, url));
            xhr.send(JSON.stringify(params));
        });
    };
}
