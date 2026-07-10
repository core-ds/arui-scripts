import { getEmbeddedModuleResources } from './utils/get-embedded-module-resources';
import { type ModuleResourcesGetter } from './create-module-loader';
import { type BaseModuleState } from './types';

type CreateEmbeddedModuleFetcherParams<GetResourcesParams> = {
    /**
     * Фолбэк-фетчер для случаев, когда встроенного (embedded) payload на странице нет
     * (например, при клиентских SPA-переходах на страницу, которая не рендерилась на сервере).
     */
    fallback?: ModuleResourcesGetter<GetResourcesParams>;
    /**
     * Id инстанса — нужен, если на странице несколько инстансов одного модуля.
     */
    instanceId?: string;
};

/**
 * Создает фетчер ресурсов модуля, который читает результат `getModuleResources`
 * из встроенного (embedded) payload-а, сериализованного хост-сервером в DOM, — без
 * повторного сетевого запроса.
 *
 * Порядок разрешения: встроенный payload → `fallback` → reject с понятной ошибкой.
 *
 * `createSsrMounter` подключает этот фетчер автоматически; standalone-экспорт нужен
 * для собственных интеграций (например, если хост сам рендерит HTML модуля).
 */
export function createEmbeddedModuleFetcher<GetResourcesParams = undefined>({
    fallback,
    instanceId,
}: CreateEmbeddedModuleFetcherParams<GetResourcesParams> = {}): ModuleResourcesGetter<
    GetResourcesParams,
    BaseModuleState
> {
    return async function getEmbeddedResources(params, options) {
        const embedded = getEmbeddedModuleResources(params.moduleId, instanceId);

        if (embedded) {
            return embedded;
        }

        if (fallback) {
            return fallback(params, options);
        }

        throw new Error(
            `Не найден встроенный payload ресурсов для модуля "${params.moduleId}"${
                instanceId ? ` (instanceId: "${instanceId}")` : ''
            }, а fallback-фетчер не задан.`,
        );
    };
}
