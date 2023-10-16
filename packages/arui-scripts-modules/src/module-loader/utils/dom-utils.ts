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
};

type GenericResourceFetcherParams = ResourceFetcherParams & {
    createTag: (src: string) => HTMLElement;
}

function resourceFetcher({
    urls,
    targetNode,
    attributes,
    abortSignal,
    createTag,
}: GenericResourceFetcherParams): Promise<HTMLElement[]> {
    return Promise.all(urls.map((src) => {
        const tag = createTag(src);

        return appendTag(tag, targetNode, attributes, abortSignal);
    }));
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
    })
}

/**
 * Подключает на страницу css приложения. Скачивает их, исправляет ссылки на ассеты так, чтобы они корректно
 * отсчитывались от базового адреса текущей страницы
 */
export async function stylesFetcher(params: ResourceFetcherParams): Promise<HTMLElement[]> {
    return resourceFetcher({
        ...params,
        createTag: (url) => {
            const link = document.createElement('link');

            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;

            return link;
        }
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
export function removeModuleResources({ moduleId, targetNodes }: RemoveModuleResourcesParams): void {
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

function appendTag(
    element: HTMLElement,
    targetNode: Node,
    attributes: Record<string, string>,
    abortSignal?: AbortSignal,
): Promise<HTMLElement> {
    Object.keys(attributes).forEach((key) => {
        element.setAttribute(key, attributes[key]);
    });

    return new Promise((resolve, reject) => {
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
            reject(error);
        });
        targetNode.appendChild(element);
    });
}
