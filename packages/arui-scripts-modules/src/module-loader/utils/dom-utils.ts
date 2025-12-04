import { isSafari } from './is-safari';

type ResourceFetcherParams = {
    /**
     * адреса подключаемых ресурсов
     */
    urls: string[];
    /**
     * HTML элемент, в который мы добавляем ресурсы
     */
    targetNode: Node;
    /**
     * Дополнительные аттрибуты, которые будут добавлены к тегу
     */
    attributes: Record<string, string>;
    /**
     * AbortSignal, который будет использован для отмены загрузки ресурсов
     */
    abortSignal?: AbortSignal;
    /**
     * Отключает встраивание inline стилей в Safari
     */
    disableInlineStyleSafari?: boolean;
};

type GenericResourceFetcherParams = ResourceFetcherParams & {
    createTag: (src: string) => HTMLElement;
    createFetcher: (
        src: string,
        element: HTMLElement,
        abortSignal?: AbortSignal,
    ) => () => Promise<HTMLElement>;
    /**
     * Возвращает существующий элемент ресурса (если он уже присутствует в дереве) или null
     */
    findExisting: (src: string, targetNode: Node) => HTMLElement | null;
};

function resourceFetcher({
    urls,
    targetNode,
    attributes,
    abortSignal,
    createTag,
    createFetcher,
    findExisting,
}: GenericResourceFetcherParams): Promise<HTMLElement[]> {
    return Promise.all(
        urls.map((src) => {
            // Если ресурс уже присутствует в дереве, тогда не дублируем тег
            const existing = findExisting(src, targetNode);

            if (existing) {
                // убеждаемся, что на существующем элементе есть необходимые атрибуты
                Object.keys(attributes).forEach((key) => {
                    if (!existing.getAttribute(key)) {
                        existing.setAttribute(key, attributes[key]);
                    }
                });

                return Promise.resolve(existing);
            }

            const tag = createTag(src);
            const fetcher = createFetcher(src, tag, abortSignal);

            return appendTag(tag, targetNode, attributes, fetcher);
        }),
    );
}

/**
 * Подключает js скрипты на страницу.
 * Просто маунтит их в DOM и резолвит промис когда все скрипты загрузятся.
 */
export function scriptsFetcher(params: ResourceFetcherParams): Promise<HTMLElement[]> {
    return resourceFetcher({
        ...params,
        createTag: (src) => {
            const script = document.createElement('script');

            script.type = 'text/javascript';
            script.src = src;
            script.defer = true;

            return script;
        },
        createFetcher: (_, element, abortSignal) => createElementFetcher(element, abortSignal),
        findExisting: (src, targetNode) => {
            if (!('querySelector' in (targetNode as ParentNode))) {
                return null;
            }
            const node = (targetNode as ParentNode).querySelector<HTMLElement>(
                `script[src="${src}"]`,
            );

            return node ?? null;
        },
    });
}

/**
 * Подключает на страницу css приложения. Скачивает их, исправляет ссылки на ассеты так, чтобы они корректно
 * отсчитывались от базового адреса текущей страницы
 */
export async function stylesFetcher(params: ResourceFetcherParams): Promise<HTMLElement[]> {
    return resourceFetcher({
        ...params,
        createTag: (url) => {
            if (!params.disableInlineStyleSafari && isSafari()) {
                const style = document.createElement('style');

                // Помогаем дедупликации в Safari: указываем источник стилей
                style.setAttribute('data-resource-url', url);

                return style;
            }

            const link = document.createElement('link');

            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;

            return link;
        },
        createFetcher: (src, element, abortSignal) => {
            if (!params.disableInlineStyleSafari && isSafari()) {
                return createContentFetcher(src, element, abortSignal);
            }

            return createElementFetcher(element, abortSignal);
        },
        findExisting: (src, targetNode) => {
            if (!('querySelector' in (targetNode as ParentNode))) {
                return null;
            }
            // Safari (inline <style>)
            if (!params.disableInlineStyleSafari && isSafari()) {
                const style = (targetNode as ParentNode).querySelector<HTMLElement>(
                    `style[data-resource-url="${src}"]`,
                );

                return style ?? null;
            }
            // Обычный <link rel="stylesheet">
            const link = (targetNode as ParentNode).querySelector<HTMLElement>(
                `link[rel="stylesheet"][href="${src}"]`,
            );

            return link ?? null;
        },
    });
}

/**
 * Название аттрибута, в который будет записываться moduleId при добавлении ресурсов в DOM
 */
const DATA_APP_ID_ATTRIBUTE = 'data-parent-app-id';

type RemoveModuleResourcesParams = {
    moduleId: string;
    targetNodes: Array<ParentNode | undefined>;
};

/**
 * Удаляет все ресурсы, которые были добавлены в дом для приложения
 * @param moduleId ID приложения, ресурсы которого мы удаляем
 * @param targetNodes Список HTML элементов, в которых мы ищем ресурсы для удаления
 */
export function removeModuleResources({
    moduleId,
    targetNodes,
}: RemoveModuleResourcesParams): void {
    targetNodes.forEach((targetNode) => {
        if (!targetNode) {
            return;
        }

        const resources = nodeListToArray(
            targetNode.querySelectorAll(`[${DATA_APP_ID_ATTRIBUTE}="${moduleId}"]`),
        );

        resources.forEach((element) => {
            element.parentNode?.removeChild(element);
        });
    });
}

function nodeListToArray<T extends Node>(nodeList: NodeListOf<T>): T[] {
    return [].slice.call(nodeList);
}

async function appendTag(
    element: HTMLElement,
    targetNode: Node,
    attributes: Record<string, string>,
    fetcher: ReturnType<GenericResourceFetcherParams['createFetcher']>,
): Promise<HTMLElement> {
    Object.keys(attributes).forEach((key) => {
        element.setAttribute(key, attributes[key]);
    });

    targetNode.appendChild(element);

    await fetcher();

    return element;
}

function createElementFetcher(element: HTMLElement, abortSignal?: AbortSignal) {
    return () =>
        new Promise<HTMLElement>((resolve, reject) => {
            element.addEventListener('load', () => {
                if (abortSignal?.aborted) {
                    // Если во время загрузки ресурса пришел сигнал об отмене, то удаляем ресурс из DOM
                    element.remove();
                    reject(new DOMException('The operation was aborted.'));
                } else {
                    resolve(element);
                }
            });
            element.addEventListener('error', (error) => {
                // Если во время загрузки ресурса произошла ошибка, то удаляем ресурс из DOM
                element.remove();
                reject(error);
            });
        });
}

function createContentFetcher(href: string, element: HTMLElement, abortSignal?: AbortSignal) {
    return async () => {
        const response = await fetch(href);
        const text = await response.text();

        if (abortSignal?.aborted) {
            element.remove();
            // Если во время загрузки ресурса пришел сигнал об отмене, то удаляем ресурс из DOM
            throw new DOMException('The operation was aborted.');
        }

        // eslint-disable-next-line no-param-reassign
        element.textContent = text;

        return element;
    };
}
