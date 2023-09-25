// TODO: remove eslint-disable and eslint-disable-next-line
/* eslint-disable no-restricted-syntax */
import webpack from 'webpack';

export function findLoader(
    config: webpack.Configuration,
    testRule: string,
): webpack.RuleSetRule | undefined {
    for (const rule of config.module!.rules!) {
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
