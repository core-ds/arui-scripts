import { getModuleOverride } from './utils/module-overrides';
import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
import { createNetworkError, createParseError, createResponseError } from './utils/request-error';
import { type ModuleResourcesGetter } from './create-module-loader';
import { getServerStateModuleFetcherParams } from './get-server-state-module-fetcher-params';
import { type BaseModuleState, type ModuleResources } from './types';

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
        // при локальной разработке адрес remote приложения может быть заменен на локальный
        const overriddenBaseUrl = getModuleOverride(params.moduleId);
        const effectiveBaseUrl = overriddenBaseUrl ?? baseUrl;
        const url = `${urlSegmentWithoutEndSlash(effectiveBaseUrl)}${relativePath}`;
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
                    const resources: ModuleResources = JSON.parse(xhr.responseText);

                    // при локальной разработке адрес remote приложения может быть заменен на локальный
                    if (overriddenBaseUrl) {
                        resources.moduleState = {
                            ...resources.moduleState,
                            baseUrl: overriddenBaseUrl,
                        };
                    }

                    resolve(resources);
                } catch (error) {
                    reject(createParseError(errorDescription, url, error));
                }
            };
            xhr.onerror = () => reject(createNetworkError(errorDescription, url));
            xhr.send(JSON.stringify(params));
        });
    };
}
