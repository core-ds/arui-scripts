import path from 'path';

import { type Configuration, CopyRspackPlugin, type RuleSetRule } from '@rspack/core';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

import { createClientRspackConfig } from '../rspack.client';

function getMainConfig(): Configuration {
    const config = createClientRspackConfig('prod');

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

type ImageminPlugin = [name: string, options?: object];

type ImageMinimizerLoader = {
    options: {
        minimizer: {
            options: { plugins: Array<string | ImageminPlugin> };
        };
    };
};

type Svgo = {
    optimize: (svg: string, config: object) => { data: string };
};

function getImageminPlugin(rules: RuleSetRule[], pluginName: string) {
    const [loader] = rules.find(isImageMinRule)?.use as unknown as ImageMinimizerLoader[];

    return loader.options.minimizer.options.plugins
        .map((plugin): ImageminPlugin => (typeof plugin === 'string' ? [plugin] : plugin))
        .find(([name]) => name === pluginName);
}

// imagemin-svgo тянет собственную версию svgo, поэтому проверяем именно е
function loadImageminSvgo(): Svgo {
    const imageminSvgoDir = path.dirname(require.resolve('imagemin-svgo'));

    return jest.requireActual(require.resolve('svgo', { paths: [imageminSvgoDir] }));
}

describe('client rspack config assets', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

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

    it('keeps svg viewBox without svgo warnings', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { optimize } = loadImageminSvgo();
        const svgoPlugin = getImageminPlugin(getOneOfRules(getMainConfig()), 'svgo');
        const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M2 2h20v20H2z"/></svg>';

        expect(svgoPlugin).toBeDefined();

        // imagemin-svgo по умолчанию включает multipass
        const { data } = optimize(svg, { multipass: true, ...svgoPlugin?.[1] });

        expect(data).toContain('viewBox="0 0 24 24"');
        expect(warn).not.toHaveBeenCalled();
    });

    it('does not add copy plugin if compression dictionaries is empty', () => {
        const { plugins = [] } = getMainConfig();

        expect(plugins.some((plugin) => plugin instanceof CopyRspackPlugin)).toBe(false);
    });
});
