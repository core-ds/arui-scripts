import { getLocalModuleOverride } from './utils/local-override';
import { urlSegmentWithoutEndSlash } from './utils/normalize-url-segment';
import { type ModuleResourcesGetter } from './create-module-loader';
import { getServerStateModuleFetcherParams } from './get-server-state-module-fetcher-params';
import { type BaseModuleState } from './types';

type CreateServerResourcesFetcherParams = {
    baseUrl: string;
    headers?: Record<string, string>;
    /**
     * Разрешает переопределять базовый адрес приложения-источника модулей через localStorage
     * (см. LOCAL_OVERRIDE_STORAGE_KEY). По-умолчанию false.
     */
    allowLocalOverride?: boolean;
};

/**
 * Функция, которая создает метод для получения ресурсов модуля с серверным состоянием
 * @param baseUrl
 * @param headers
 * @param allowLocalOverride Флаг, включающий локальный оверрайд адреса модуля через localStorage
 */
export function createServerStateModuleFetcher<GetResourcesParams = undefined>({
    baseUrl,
    headers = {},
    allowLocalOverride = false,
}: CreateServerResourcesFetcherParams): ModuleResourcesGetter<GetResourcesParams, BaseModuleState> {
    return async function fetchServerResources(params, options) {
        const { relativePath, method } = getServerStateModuleFetcherParams();
        const overrideBaseUrl = allowLocalOverride
            ? getLocalModuleOverride(params.moduleId)
            : undefined;
        const effectiveBaseUrl = overrideBaseUrl ?? baseUrl;
        const url = `${urlSegmentWithoutEndSlash(effectiveBaseUrl)}${relativePath}`;

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
            // В теле может быть полезная для клиента информация об ошибке, поэтому кладём его
            // в сообщение целиком. Статус (без statusText) включаем всегда: под HTTP/2
            // statusText приходит пустым.
            const responseText = await response.text().catch(() => '');

            throw new Error(
                `Module resources request for ${params.moduleId} failed: ${url} responded with ${
                    response.statusText
                        ? `${response.status} ${response.statusText}`
                        : response.status
                }${responseText ? `\n${responseText}` : ''}`,
            );
        }

        return response.json();
    };
}
