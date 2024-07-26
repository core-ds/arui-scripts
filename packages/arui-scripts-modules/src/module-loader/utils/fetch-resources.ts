import { scriptsFetcher, stylesFetcher } from './dom-utils';
import { urlSegmentWithoutEndSlash } from './normalize-url-segment';

type MountModuleResourcesParams = {
    jsTargetNode: ParentNode;
    cssTargetNode: ParentNode;
    cssTargetSelector: string | undefined;
    moduleId: string;
    scripts: string[];
    styles: string[];
    baseUrl: string;
    esmMode?: boolean;
    abortSignal?: AbortSignal;
};

/**
 * Название аттрибута, в который будет записываться moduleId при добавлении ресурсов в DOM
 */
const DATA_APP_ID_ATTRIBUTE = 'data-parent-app-id';

export async function fetchResources({
    jsTargetNode,
    cssTargetNode,
    cssTargetSelector,
    moduleId,
    scripts,
    styles,
    baseUrl,
    esmMode,
    abortSignal,
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

    const scriptsUrls = scripts.map((src) => `${urlSegmentWithoutEndSlash(baseUrl)}/${src}`);
    const stylesUrls = styles.map((src) => `${urlSegmentWithoutEndSlash(baseUrl)}/${src}`);

    // находим и удяляем ресурсы того же самого модуля, которые были добавлены ранее
    const previouslyAddedScripts = Array.from(jsTargetNode.querySelectorAll(`script[${DATA_APP_ID_ATTRIBUTE}="${moduleId}"]`));
    const previouslyAddedStyles = Array.from(cssTargetNode.querySelectorAll(`link[${DATA_APP_ID_ATTRIBUTE}="${moduleId}"]`));

    previouslyAddedScripts.forEach((script) => script.remove());
    previouslyAddedStyles.forEach((style) => style.remove());

    await Promise.all([
        scriptsFetcher({
            urls: scriptsUrls,
            targetNode: jsTargetNode,
            attributes: jsTagsAttributes,
            esmMode,
            abortSignal,
        }),
        stylesFetcher({
            urls: stylesUrls,
            targetNode: cssTargetNode,
            attributes: cssTagsAttributes,
            abortSignal,
        }),
    ]);
}

type GetTargetNodesParams = {
    resourcesTargetNode: HTMLElement | undefined;
    cssTargetSelector: string | undefined;
}

export function getResourcesTargetNodes({
    resourcesTargetNode,
    cssTargetSelector,
}: GetTargetNodesParams) {
    const jsResourcesTargetNode = resourcesTargetNode || document.head;
    let cssResourcesTargetNode: ParentNode = jsResourcesTargetNode;

    if (cssTargetSelector) {
        const possibleCssTarget = document.querySelector(cssTargetSelector);

        if (possibleCssTarget) {
            cssResourcesTargetNode = possibleCssTarget.shadowRoot ? possibleCssTarget.shadowRoot : possibleCssTarget;
        }
    }

    return {
        js: jsResourcesTargetNode,
        css: cssResourcesTargetNode,
    };
}
