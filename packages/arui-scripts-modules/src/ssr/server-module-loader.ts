import { type ModuleResourcesGetter } from '../module-loader/create-module-loader';
import { type BaseModuleState, type ModuleResources } from '../module-loader/types';
import { resolveResourceUrl } from '../module-loader/utils/fetch-resources';

/**
 * Как хост-сервер отдаёт стили SSR-модуля.
 * inline — скачивает CSS и встраивает его в <style>.
 * link — отдаёт <link rel="stylesheet"> без server-to-server скачивания CSS.
 */
export type StylesMode = 'inline' | 'link';

/**
 * Функция, скачивающая содержимое css-файла модуля (server-to-server) для инлайна
 * в HTML. По умолчанию — глобальный `fetch` (Node 18+).
 */
export type FetchStyleContent = (url: string) => Promise<string>;

export type InlineStyle = {
    /** resolved URL стиля — используется как `data-module-ssr-href` для «усыновления» на клиенте */
    href: string;
    /** содержимое css-файла */
    content: string;
};

export type ServerModulePayload<ModuleState extends BaseModuleState = BaseModuleState> = {
    resources: ModuleResources<ModuleState>;
    /** resolved URL стилей — используются для inline и link SSR-вывода */
    styleUrls: string[];
    inlineStyles: InlineStyle[];
};

type LoadServerModuleParams<GetResourcesParams, ModuleState extends BaseModuleState> = {
    moduleId: string;
    hostAppId: string;
    params: GetResourcesParams;
    ssrRunParams: unknown;
    getModuleResources: ModuleResourcesGetter<GetResourcesParams, ModuleState>;
    fetchStyleContent: FetchStyleContent;
    stylesMode: StylesMode;
    signal?: AbortSignal;
};

// Кеш скачанного css в рамках процесса. URL ассетов модуля содержат content-hash,
// поэтому кешировать по URL безопасно.
const styleContentCache = new Map<string, Promise<string>>();

export function createDefaultFetchStyleContent(): FetchStyleContent {
    return async (url) => {
        let cached = styleContentCache.get(url);

        if (!cached) {
            cached = fetch(url).then((response) => {
                if (!response.ok) {
                    throw new Error(`Не удалось скачать css модуля: ${url} (${response.status})`);
                }

                return response.text();
            });
            styleContentCache.set(url, cached);
        }

        try {
            return await cached;
        } catch (error) {
            // не кешируем ошибку, чтобы следующий рендер попробовал снова
            styleContentCache.delete(url);
            throw error;
        }
    };
}

/**
 * Серверная загрузка модуля: запрашивает ресурсы (с флагом `ssr`, чтобы сервер модуля
 * отрендерил html) и скачивает css для инлайна. Ошибку скачивания отдельного стиля не
 * эскалируем — стиль просто не инлайнится, а клиент подключит его сам.
 */
export async function loadServerModule<
    GetResourcesParams,
    ModuleState extends BaseModuleState = BaseModuleState,
>({
    moduleId,
    hostAppId,
    params,
    ssrRunParams,
    getModuleResources,
    fetchStyleContent,
    stylesMode,
    signal,
}: LoadServerModuleParams<GetResourcesParams, ModuleState>): Promise<
    ServerModulePayload<ModuleState>
> {
    const resources = await getModuleResources(
        {
            moduleId,
            hostAppId,
            params,
            ssr: { runParams: ssrRunParams },
        },
        { signal },
    );

    const { baseUrl } = resources.moduleState;
    const styleUrls = resources.styles.map((src) => resolveResourceUrl(src, baseUrl));

    const inlineStyles =
        stylesMode === 'inline'
            ? await Promise.all(
                  styleUrls.map(async (href): Promise<InlineStyle | null> => {
                      try {
                          return { href, content: await fetchStyleContent(href) };
                      } catch {
                          return null;
                      }
                  }),
              )
            : [];

    return {
        resources,
        styleUrls,
        inlineStyles: inlineStyles.filter((style): style is InlineStyle => style !== null),
    };
}
