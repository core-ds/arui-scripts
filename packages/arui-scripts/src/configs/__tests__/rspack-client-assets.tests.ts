import { type Configuration, type RuleSetRule } from '@rspack/core';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

import { createClientWebpackConfig } from '../rspack.client';

function getMainConfig(): Configuration {
    const config = createClientWebpackConfig('prod');

    return Array.isArray(config) ? config[0] : config;
}

function getOneOfRules(config: Configuration): RuleSetRule[] {
    const [rule] = (config.module?.rules ?? []) as RuleSetRule[];

    return (rule.oneOf ?? []) as RuleSetRule[];
}

function isImageMinRule(rule: RuleSetRule) {
    return (
        Array.isArray(rule.use) &&
        rule.use.some(
            (loader) =>
                typeof loader === 'object' &&
                loader !== null &&
                'loader' in loader &&
                loader.loader === ImageMinimizerPlugin.loader,
        )
    );
}

describe('client rspack config assets', () => {
    it('minifies svg before the generic svg rule catches it', () => {
        const rules = getOneOfRules(getMainConfig());
        const imageMinIndex = rules.findIndex(isImageMinRule);
        const svgIndex = rules.findIndex((rule) => String(rule.test) === String(/\.svg/));

        expect(imageMinIndex).toBeGreaterThanOrEqual(0);

        expect(imageMinIndex).toBeLessThan(svgIndex);

        expect(rules[imageMinIndex]).toMatchObject({
            type: 'asset',
            parser: { dataUrlCondition: { maxSize: expect.any(Number) } },
        });
    });
});
