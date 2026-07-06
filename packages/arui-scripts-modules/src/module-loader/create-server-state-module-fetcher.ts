import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
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
    return async function fetchServerResources(params, options) {
        const { relativePath, method } = getServerStateModuleFetcherParams();
        const url = `${urlSegmentWithoutEndSlash(baseUrl)}${relativePath}`;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(params),
            signal: options?.signal,
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        return response.json();
    };
}
