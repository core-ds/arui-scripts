import { getModuleOverride } from './utils/module-overrides';
import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
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
        // В dev-режиме адрес приложения-провайдера может быть подменен на локальный, см. getModuleOverride.
        // В production-сборке этот вызов всегда возвращает undefined и вырезается минификатором.
        const overriddenBaseUrl = getModuleOverride(params.moduleId);
        const effectiveBaseUrl = overriddenBaseUrl ?? baseUrl;
        const url = `${urlSegmentWithoutEndSlash(effectiveBaseUrl)}${relativePath}`;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(method, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            Object.keys(headers).forEach((headerName) => {
                xhr.setRequestHeader(headerName, headers[headerName]);
            });
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const resources: ModuleResources = JSON.parse(xhr.responseText);

                    // Локальный сервер модуля вполне может вернуть адрес стенда, захардкоженный в его
                    // конфиге. Раз разработчик явно попросил грузить модуль с локального адреса -
                    // подмена должна выигрывать, иначе ресурсы поедут со стенда.
                    if (overriddenBaseUrl) {
                        resources.moduleState = {
                            ...resources.moduleState,
                            baseUrl: overriddenBaseUrl,
                        };
                    }

                    resolve(resources);
                } else {
                    reject(new Error(xhr.statusText));
                }
            };
            xhr.onerror = () => reject(new Error(xhr.statusText));
            xhr.send(JSON.stringify(params));
        });
    };
}
