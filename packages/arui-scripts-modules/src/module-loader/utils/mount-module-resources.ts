import { ConsumersCounter } from './consumers-counter';
import { scriptsFetcher, stylesFetcher } from './dom-utils';

type MountModuleResourcesParams = {
    resourcesTargetNode: HTMLElement | undefined;
    cssTargetSelector: string | undefined;
    moduleConsumersCounter: ConsumersCounter;
    moduleId: string;
    scripts: string[];
    styles: string[];
    baseUrl: string;
};

export async function mountModuleResources({
    resourcesTargetNode,
    cssTargetSelector,
    moduleConsumersCounter,
    moduleId,
    scripts,
    styles,
    baseUrl,
}: MountModuleResourcesParams) {
    const jsResourcesTargetNode = resourcesTargetNode || document.head;
    let cssResourcesTargetNode: ParentNode = jsResourcesTargetNode;
    const jsTagsAttributes: Record<string, string> = {};

    if (cssTargetSelector) {
        const possibleCssTarget = document.querySelector(cssTargetSelector);

        if (possibleCssTarget) {
            cssResourcesTargetNode = possibleCssTarget.shadowRoot ? possibleCssTarget.shadowRoot : possibleCssTarget;
        }
        // Этот атрибут использует css-loader из arui-scripts, для того чтобы вставить css в нужное место при runtime загрузке
        jsTagsAttributes['data-resources-target-selector'] = cssTargetSelector;
    }

    // Подключаем ресурсы модуля на страницу
    await Promise.all([
        moduleConsumersCounter.isAbsent()
            ? scriptsFetcher({
                moduleId,
                urls: scripts,
                baseUrl,
                targetNode: jsResourcesTargetNode,
                attributes: jsTagsAttributes,
            })
            : Promise.resolve(),
        moduleConsumersCounter.isAbsent()
            ? stylesFetcher({
                moduleId,
                urls: styles,
                baseUrl,
                targetNode: cssResourcesTargetNode,
            })
            : Promise.resolve(),
    ]);

    return [jsResourcesTargetNode, cssResourcesTargetNode];
}
