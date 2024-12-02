// TODO: remove eslint-disable
/* eslint-disable no-param-reassign */
import { PluginCreator, Root } from 'postcss';

type PostCssPrefixOptions = {
    prefix: string;
};

const VisitedRule = Symbol('VisitedRule');

type RootWithVisitedRule = Root & {
    [VisitedRule]?: boolean;
};

type NodeWithVisitedAndParent = {
    [VisitedRule]?: boolean;
    parent?: NodeWithVisitedAndParent;
};

const KEYFRAME_RULES = ['keyframes', '-webkit-keyframes', '-moz-keyframes', '-o-keyframes'];

const postCssPrefix: PluginCreator<PostCssPrefixOptions> = (options) => {
    const prefix = options?.prefix || '.prefix ';

    return {
        postcssPlugin: '@alfalab/postcss-prefix-selector',
        RootExit(root: RootWithVisitedRule) {
            if (root[VisitedRule]) {
                return;
            }

            root[VisitedRule] = true;

            root.walkRules((rule) => {
                const hasParent = !!rule.parent;
                const parentIsAtRule = rule.parent && rule.parent.type === 'atrule';
                const parentIsKeyframe =
                    parentIsAtRule && KEYFRAME_RULES.includes((rule.parent as any).name);

                if (hasParent && parentIsKeyframe) {
                    // Нам не нужно добавлять префиксы для keyframes и элементов внутри них
                    return;
                }

                (rule as NodeWithVisitedAndParent)[VisitedRule] = true;

                if (isAnyParentVisited(rule)) {
                    // если хотя бы один из родителей (кроме root) был посещен, то не добавляем префикс
                    return;
                }

                // Добавляем префикс к каждому селектору, чтобы не терялась специфичность
                rule.selectors = rule.selectors.map((selector) => `${prefix}${selector}`);
            });
        },
    };
};

/**
 * Проверяет, что хотя бы один из родителей был посещен. Если посещен Root элемент, то возвращает false
 * @param rule
 */
function isAnyParentVisited(rule: NodeWithVisitedAndParent) {
    let { parent } = rule;

    while (parent) {
        if (!parent.parent) {
            return false;
        }
        if (parent[VisitedRule]) {
            return true;
        }
        parent = parent.parent;
    }

    return false;
}

postCssPrefix.postcss = true;

export { postCssPrefix };
