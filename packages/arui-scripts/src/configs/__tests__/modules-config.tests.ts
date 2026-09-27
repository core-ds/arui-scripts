import { type Configuration } from '@rspack/core';

import { configs } from '../app-configs';
import { type CompatModuleConfig } from '../app-configs/types';
import {
    getCssPrefixForModule,
    getExposeLoadersFormCompatModules,
    patchMainRspackConfigForModules,
    patchWebpackConfigForCompat,
} from '../modules';

jest.mock('../app-configs', () => ({ configs: { normalizedName: 'app', publicPath: '/assets/' } }));

describe('module federation and compat configuration', () => {
    beforeEach(() => {
        configs.modules = null;
        configs.compatModules = null;
        configs.disableModulesSupport = false;
    });
    const base = (): Configuration => ({ module: { rules: [] }, plugins: [], output: {} });

    test('allows projects to disable module handling', () => {
        configs.disableModulesSupport = true;
        const config = base();

        expect(patchMainRspackConfigForModules(config, 'both')).toBe(config);
        expect(config.plugins).toEqual([]);
    });
    test.each([{}, { module: { rules: [] } }, { plugins: [] }])(
        'handles incomplete overridden configuration: %j',
        (config) => {
            expect(patchMainRspackConfigForModules(config, 'consumer')).toBe(config);
        },
    );
    test('retains sharing runtime for consumers without exposed modules', () => {
        const config = patchMainRspackConfigForModules(base(), 'consumer');

        expect(config.plugins).toHaveLength(1);
        expect(patchMainRspackConfigForModules(base(), 'provider').plugins).toHaveLength(0);
    });
    test.each(['consumer', 'provider', 'both'] as const)(
        'sets the correct public path for %s without exposes',
        (mode) => {
            configs.modules = { name: 'my-module', shared: {} };
            const config = patchMainRspackConfigForModules(base(), mode);

            expect(config.output?.publicPath).toBe('/assets/');
            if (mode === 'provider') expect(config.output?.uniqueName).toBe('my_module_wmf');
        },
    );
    test('injects CSS prefixes into normal and module CSS loaders', () => {
        configs.modules = {
            shared: {},
            exposes: { card: './card' },
            options: { cssPrefix: '.card', separateBuildShared: {} },
        };
        const normal = {
            loader: '/node_modules/postcss-loader/index.js',
            options: { postcssOptions: { plugins: [] } },
        };
        const modules = { loader: 'postcss-loader', options: { postcssOptions: { plugins: [] } } };
        const config = base();

        config.module = {
            rules: [
                { test: /\.css$/, use: ['style-loader', normal] },
                { test: /\.module\.css$/, use: [modules] },
            ],
        };
        const result = patchMainRspackConfigForModules(config, 'provider');

        expect(result.output?.publicPath).toBe('auto');
        expect(normal.options.postcssOptions.plugins).toEqual([
            expect.objectContaining({ postcssPlugin: '@alfalab/postcss-prefix-selector' }),
        ]);
        expect(modules.options.postcssOptions.plugins).toHaveLength(1);
        expect(
            result.plugins?.some(
                (plugin) => plugin?.constructor.name === 'AttributeModuleCssPlugin',
            ),
        ).toBe(true);
    });
    test('preserves external libraries and namespaces in compat modules', () => {
        const result = patchWebpackConfigForCompat(
            {
                name: 'card',
                entry: './card',
                externals: { react: 'React' },
                cssPrefix: false,
            } as CompatModuleConfig,
            { externals: { lodash: '_' }, output: { filename: 'card.js' } },
        );

        expect(result.externals).toEqual({ lodash: '_', react: 'React' });
        expect(result.output).toEqual({
            filename: 'card.js',
            publicPath: 'auto',
            uniqueName: 'card',
        });
        expect(
            patchWebpackConfigForCompat({ name: 'plain' } as CompatModuleConfig, {}).externals,
        ).toEqual({});
    });
    test.each([
        [undefined, '.module-card'],
        [false, undefined],
        ['.custom', '.custom'],
    ] as const)('resolves compat CSS prefix %s', (cssPrefix, expected) => {
        expect(getCssPrefixForModule({ name: 'card', cssPrefix } as CompatModuleConfig)).toBe(
            expected,
        );
    });
    test('exposes configured shared libraries only', () => {
        expect(getExposeLoadersFormCompatModules()).toEqual([]);
        configs.compatModules = { shared: { react: 'React' } };
        expect(getExposeLoadersFormCompatModules()).toEqual([
            {
                test: require.resolve('react'),
                use: [
                    { loader: require.resolve('expose-loader'), options: { exposes: ['React'] } },
                ],
            },
        ]);
    });
});
