// TODO: remove eslint-disable
/* eslint-disable no-param-reassign */
import { PluginCreator } from 'postcss';

type PostCssPrefixOptions = {
    prefix: string;
};

const VisitedRule = Symbol('VisitedRule');

const postCssPrefix: PluginCreator<PostCssPrefixOptions> = (options) => {
    const prefix = options?.prefix || '.prefix ';

    return {
        postcssPlugin: '@alfalab/postcss-prefix-selector',
        RootExit(root) {
            if ((root as any)[VisitedRule]) {
                return;
            }

            (root as any)[VisitedRule] = true;

            root.walkRules((rule) => {
                if (
                    !rule.parent ||
                    (rule.parent.type !== 'root' &&
                        (rule.parent.type !== 'atrule' || (rule.parent as any).name !== 'media'))
                ) {
                    return;
                }
                rule.selectors = rule.selectors.map((selector, index) => {
                    if (index === 0) {
                        return `${prefix}${selector}`;
                    }

                    return selector;
                });
            });
        },
    };
};

postCssPrefix.postcss = true;

export { postCssPrefix };
