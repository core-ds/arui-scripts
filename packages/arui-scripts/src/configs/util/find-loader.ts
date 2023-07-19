import webpack from "webpack";

export function findLoader(config: webpack.Configuration, testRule: string): webpack.RuleSetRule | undefined {
    for (const rule of config.module!.rules!) {
        if (rule === '...' || !rule) {
            // Webpack имеет странный тип для rules, который позволяет в него положить строку '...'. Успокаиваем TS
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
}
