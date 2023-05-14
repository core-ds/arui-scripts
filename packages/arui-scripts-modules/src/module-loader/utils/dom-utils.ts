import { urlSegmentWithoutEndSlash } from './normalize-url-segment';

/**
 * Подключает js скрипты на страницу.
 * Просто маунтит их в DOM и резолвит промис когда все скрипты загрузятся.
 * @param appId ID приложения, которое запросило эти скрипты
 * @param urls адреса подключаемых скриптов
 * @param baseUrl базовый адрес модуля
 */
export function scriptsFetcher(
    appId: string,
    urls: string[],
    baseUrl: string,
): Promise<HTMLElement[]> {
    return Promise.all(urls.map((src) => appendScriptTag(src, baseUrl, appId)));
}

/**
 * Подключает на страницу css приложения. Скачивает их, исправляет ссылки на ассеты так, чтобы они корректно
 * отсчитывались от базового адреса текущей страницы
 * @param appId ID приложения, которое запросило эти стили
 * @param urls адреса подключаемых стилей
 * @param baseUrl базовый адрес модуля
 */
export async function stylesFetcher(
    appId: string,
    urls: string[],
    baseUrl: string,
): Promise<HTMLElement[]> {
    const promises = urls.map((url) => {
        return appendCssTag(`${urlSegmentWithoutEndSlash(baseUrl)}/${url}`, appId);
    });

    return Promise.all(promises);
}

/**
 * Удаляет все ресурсы, которые были добавлены в дом для приложения
 * @param appId ID приложения, ресурсы которого мы удаляем
 */
export function removeAppResources(appId: string) {
    const resources = getResourcesForApp(appId);

    resources.forEach((element) => {
        element.parentNode?.removeChild(element);
    });
}

/**
 * Название аттрибута, в который будет записываться appId приложения, которое загрузило эти элементы
 */
const DATA_APP_ID_ATTRIBUTE = 'data-parent-app-id';

function getResourcesTargetNode() {
    return document.head;
}

function getResourcesForApp(appId: string): Node[] {
    return [].slice.call(
        getResourcesTargetNode().querySelectorAll(`[${DATA_APP_ID_ATTRIBUTE}="${appId}"]`),
    );
}

function appendTagAsync(element: HTMLElement): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
        element.addEventListener('load', () => {
            resolve(element);
        });
        element.addEventListener('error', (error) => {
            reject(error);
        });
        getResourcesTargetNode().appendChild(element);
    });
}

function appendTagSync(element: HTMLElement): HTMLElement {
    getResourcesTargetNode().appendChild(element);

    return element;
}

function appendScriptTag(src: string, baseUrl: string, appId: string) {
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = `${urlSegmentWithoutEndSlash(baseUrl)}/${src}`;
    script.defer = true;
    // используем setAttribute, а не dataset потому что так нам не надо конвертировать название аттрибута в js/html вид
    script.setAttribute(DATA_APP_ID_ATTRIBUTE, appId);

    return appendTagAsync(script);
}

function appendCssTag(href: string, appId: string) {
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    link.setAttribute(DATA_APP_ID_ATTRIBUTE, appId);

    return appendTagSync(link);
}
