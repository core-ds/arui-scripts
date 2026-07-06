import { scriptsFetcher, stylesFetcher } from './dom-utils';
import { MODULE_SSR_HREF_ATTRIBUTE } from './get-embedded-module-resources';
import { isSafari } from './is-safari';
import { urlSegmentWithoutEndSlash } from './normalize-url-segment';

type MountModuleResourcesParams = {
    jsTargetNode: ParentNode;
    cssTargetNode: ParentNode;
    cssTargetSelector: string | undefined;
    moduleId: string;
    scripts: string[];
    styles: string[];
    baseUrl: string;
    abortSignal?: AbortSignal;
    disableInlineStyleSafari?: boolean;
};

/**
 * Название аттрибута, в который будет записываться moduleId при добавлении ресурсов в DOM
 */
const DATA_APP_ID_ATTRIBUTE = 'data-parent-app-id';
const ABSOLUTE_URL_REGEXP = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
const URL_ORIGIN_REGEXP = /^(?:[a-z][a-z\d+.-]*:)?\/\/[^/]+/i;
/**
 * Сколько ждать загрузки «усыновлённого» серверного `<link>`-стиля, у которого ещё
 * нет `sheet` и не сработал `load`, прежде чем продолжить (чтобы не подвесить монтирование).
 */
const ADOPTED_LINK_LOAD_TIMEOUT = 5000;

export async function fetchResources({
    jsTargetNode,
    cssTargetNode,
    cssTargetSelector,
    moduleId,
    scripts,
    styles,
    baseUrl,
    abortSignal,
    disableInlineStyleSafari,
}: MountModuleResourcesParams) {
    const cssTagsAttributes: Record<string, string> = {
        [DATA_APP_ID_ATTRIBUTE]: moduleId,
    };
    const jsTagsAttributes: Record<string, string> = {
        [DATA_APP_ID_ATTRIBUTE]: moduleId,
    };

    if (cssTargetSelector) {
        // Этот атрибут использует css-loader из arui-scripts, для того чтобы вставить css в нужное место при runtime загрузке
        jsTagsAttributes['data-resources-target-selector'] = cssTargetSelector;
    }

    const scriptsUrls = scripts.map((src) => resolveResourceUrl(src, baseUrl));
    const stylesUrls = styles.map((src) => resolveResourceUrl(src, baseUrl));

    const scriptTag = 'script';
    const styleTag = !disableInlineStyleSafari && isSafari() ? 'style' : 'link';

    // Скрипты сервер не эмитит (он никогда не исполняет js модуля), поэтому их
    // загрузка не меняется: удаляем ранее добавленные и подключаем заново.
    const previouslyAddedScripts = Array.from(
        jsTargetNode.querySelectorAll(`${scriptTag}[${DATA_APP_ID_ATTRIBUTE}="${moduleId}"]`),
    );

    previouslyAddedScripts.forEach((script) => script.remove());

    // Если хост-сервер отрендерил стили модуля (SSR), они уже присутствуют в DOM с
    // атрибутом `data-module-ssr-href`. Их нужно «усыновить»: оставить на месте и не
    // перезагружать, иначе получим ровно то мигание, ради устранения которого делается SSR.
    const { adoptedStyleTags, stylesUrlsToFetch } = adoptSsrStyles({
        cssTargetNode,
        moduleId,
        stylesUrls,
    });

    // Удаляем ранее добавленные (не серверные) стили этого модуля, кроме усыновлённых.
    const previouslyAddedStyles = Array.from(
        cssTargetNode.querySelectorAll(`${styleTag}[${DATA_APP_ID_ATTRIBUTE}="${moduleId}"]`),
    ).filter((style) => !adoptedStyleTags.includes(style));

    previouslyAddedStyles.forEach((style) => style.remove());

    await Promise.all([
        scriptsFetcher({
            urls: scriptsUrls,
            targetNode: jsTargetNode,
            attributes: jsTagsAttributes,
            abortSignal,
        }),
        stylesFetcher({
            urls: stylesUrlsToFetch,
            targetNode: cssTargetNode,
            attributes: cssTagsAttributes,
            abortSignal,
            disableInlineStyleSafari,
        }),
        ...adoptedStyleTags.map((tag) => awaitAdoptedStyleLoaded(tag, abortSignal)),
    ]);
}

type AdoptSsrStylesParams = {
    cssTargetNode: ParentNode;
    moduleId: string;
    stylesUrls: string[];
};

/**
 * Сопоставляет серверные стили модуля (`<style>`/`<link>` с `data-module-ssr-href`)
 * с запрашиваемыми URL и «усыновляет» совпавшие: они остаются в DOM и не перезагружаются.
 * Несовпавшие серверные теги (например, изменилась версия модуля между рендером на сервере
 * и клиентской навигацией) удаляются. Если серверных стилей нет — поведение прежнее.
 */
function adoptSsrStyles({ cssTargetNode, moduleId, stylesUrls }: AdoptSsrStylesParams): {
    adoptedStyleTags: Element[];
    stylesUrlsToFetch: string[];
} {
    const ssrStyleTags = Array.from(
        cssTargetNode.querySelectorAll(
            `[${DATA_APP_ID_ATTRIBUTE}="${moduleId}"][${MODULE_SSR_HREF_ATTRIBUTE}]`,
        ),
    );

    if (ssrStyleTags.length === 0) {
        return { adoptedStyleTags: [], stylesUrlsToFetch: stylesUrls };
    }

    const remainingUrls = new Set(stylesUrls);
    const adoptedStyleTags: Element[] = [];

    ssrStyleTags.forEach((tag) => {
        const tagUrl =
            tag.getAttribute(MODULE_SSR_HREF_ATTRIBUTE) ??
            tag.getAttribute('href') ??
            tag.getAttribute('src');

        if (tagUrl && remainingUrls.has(tagUrl)) {
            adoptedStyleTags.push(tag);
            remainingUrls.delete(tagUrl);
        } else {
            // Серверный тег, который не соответствует ни одному запрашиваемому ресурсу.
            tag.remove();
        }
    });

    return {
        adoptedStyleTags,
        stylesUrlsToFetch: stylesUrls.filter((url) => remainingUrls.has(url)),
    };
}

/**
 * Дожидается готовности усыновлённого серверного стиля.
 * Inline `<style>` по определению загружен. Для `<link>` проверяем наличие `sheet`,
 * иначе ждём событие `load` с таймаут-фолбэком, чтобы не подвесить монтирование.
 */
function awaitAdoptedStyleLoaded(element: Element, abortSignal?: AbortSignal): Promise<void> {
    if (element.tagName.toLowerCase() !== 'link') {
        return Promise.resolve();
    }

    const link = element as HTMLLinkElement;

    if (link.sheet) {
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        let timer: ReturnType<typeof setTimeout>;

        const finish = () => {
            clearTimeout(timer);
            link.removeEventListener('load', finish);
            link.removeEventListener('error', finish);
            abortSignal?.removeEventListener('abort', finish);
            resolve();
        };

        // Ошибку/таймаут не эскалируем: стиль уже был отрендерен сервером, продолжаем монтирование.
        timer = setTimeout(finish, ADOPTED_LINK_LOAD_TIMEOUT);

        link.addEventListener('load', finish);
        link.addEventListener('error', finish);
        abortSignal?.addEventListener('abort', finish);
    });
}

function resolveResourceUrl(src: string, baseUrl: string) {
    if (ABSOLUTE_URL_REGEXP.test(src)) {
        return src;
    }

    if (!baseUrl) {
        return src[0] === '/' ? src : `/${src}`;
    }

    if (ABSOLUTE_URL_REGEXP.test(baseUrl) && src[0] === '/') {
        const origin = baseUrl.match(URL_ORIGIN_REGEXP)?.[0];

        if (origin) {
            return `${origin}${src}`;
        }
    }

    return `${urlSegmentWithoutEndSlash(baseUrl)}/${src.replace(/^\/+/, '')}`;
}

type GetTargetNodesParams = {
    resourcesTargetNode: HTMLElement | undefined;
    cssTargetSelector: string | undefined;
};

export function getResourcesTargetNodes({
    resourcesTargetNode,
    cssTargetSelector,
}: GetTargetNodesParams) {
    const jsResourcesTargetNode = resourcesTargetNode || document.head;
    let cssResourcesTargetNode: ParentNode = jsResourcesTargetNode;

    if (cssTargetSelector) {
        const possibleCssTarget = document.querySelector(cssTargetSelector);

        if (possibleCssTarget) {
            cssResourcesTargetNode = possibleCssTarget.shadowRoot
                ? possibleCssTarget.shadowRoot
                : possibleCssTarget;
        }
    }

    return {
        js: jsResourcesTargetNode,
        css: cssResourcesTargetNode,
    };
}
