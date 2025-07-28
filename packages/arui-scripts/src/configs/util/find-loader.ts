import type { Configuration, RuleSetRule } from '@rspack/core';

export function findLoader(config: Configuration, testRule: string): RuleSetRule | undefined {
    for (const rule of config.module?.rules ?? []) {
        if (rule === '...' || !rule) {
            // Webpack имеет странный тип для rules, который позволяет в него положить строку '...'. Успокаиваем TS
            // eslint-disable-next-line no-continue
            continue;
        }

        if (rule.test && rule.test.toString() === testRule) {
            return rule;
        }

        if (rule.oneOf) {
            for (const oneOfRule of rule.oneOf) {
                if (oneOfRule && oneOfRule.test && oneOfRule?.test?.toString() === testRule) {
                    return oneOfRule;
                }
            }
        }
    }

    return undefined;
}
