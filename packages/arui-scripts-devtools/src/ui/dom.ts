/**
 * Панель собирается руками, без React и вообще без зависимостей: её энтрипоинт инжектится
 * абсолютным путём из node_modules самого arui-scripts, поэтому любой `import 'react'` внутри
 * резолвился бы от дерева arui-scripts, а не приложения — второй React появился бы по построению.
 * Плюс панель не должна попадать в share scope, за которым она же и наблюдает.
 */
export function createElement<Tag extends keyof HTMLElementTagNameMap>(
    tag: Tag,
    className?: string,
    text?: string,
): HTMLElementTagNameMap[Tag] {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}
