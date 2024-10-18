import { createSingleClientWebpackConfig } from '../../webpack.client';
import { createServerConfig } from '../../webpack.server';
import { findPlugin } from '../find-plugin';

const getPlugins = (
    plugins: any,
    name: string,
    property: (...props: any[]) => Record<string, unknown>,
) =>
    plugins.map((plugin: unknown) => {
        if (plugin?.constructor.name === name) {
            const typedPlugin = plugin as any;

            return {
                ...typedPlugin,
                ...property(typedPlugin),
            };
        }

        return plugin;
    });

describe('override plugins with findPlugin', () => {
    describe("client's findPlugin", () => {
        it('should return original client dev config with modified MiniCssExtractPlugin: options.ignoreOrder = false', () => {
            const devConfig = createSingleClientWebpackConfig('dev', './index.ts');

            const [MiniCssExtractPlugin] = findPlugin<'client'>()(
                devConfig,
                'CssExtractRspackPlugin',
            );

            MiniCssExtractPlugin.options.ignoreOrder = false;

            expect(devConfig).toMatchObject<typeof devConfig>({
                ...devConfig,
                plugins: getPlugins(devConfig.plugins, 'CssExtractRspackPlugin', (pluginOptions) => ({
                    ...pluginOptions,
                    options: {
                        ...pluginOptions.options,
                        ignoreOrder: false,
                    },
                })),
            });
        });

        it('should return original client prod config with modified WebpackManifestPlugin: options.fileName = super-app-manifest.json', () => {
            const prodConfig = createSingleClientWebpackConfig('prod', './index.ts');

            const [WebpackManifestPlugin] = findPlugin<'client'>()(
                prodConfig,
                'WebpackManifestPlugin',
            );

            WebpackManifestPlugin.options = {
                ...WebpackManifestPlugin.options,
                fileName: 'super-app-manifest.json',
            };

            expect(prodConfig).toMatchObject<typeof prodConfig>({
                ...prodConfig,
                plugins: getPlugins(
                    prodConfig.plugins,
                    'WebpackManifestPlugin',
                    (pluginOptions) => ({
                        ...pluginOptions,
                        options: {
                            ...pluginOptions.options,
                            fileName: 'super-app-manifest.json',
                        },
                    }),
                ),
            });
        });
    });

    describe("server's findPlugin", () => {
        // it('should return original server dev config with modified BannerPlugin: options.banner = "sell garage"', () => {
        //     const devConfig = createServerConfig('dev');
        //
        //     const [BannerPlugin] = findPlugin<'server'>()(devConfig, 'BannerPlugin');
        //
        //     BannerPlugin.options.banner = 'sell garage';
        //
        //     expect(devConfig).toMatchObject<typeof devConfig>({
        //         ...devConfig,
        //         plugins: getPlugins(devConfig.plugins, 'BannerPlugin', (pluginOptions) => ({
        //             ...pluginOptions,
        //             options: {
        //                 ...pluginOptions.options,
        //                 banner: 'sell garage',
        //             },
        //         })),
        //     });
        // });

        it('should return original server dev config with modified WatchMissingNodeModulesPlugin: nodeModulesPath = ./123', () => {
            const devConfig = createServerConfig('dev');

            const [WatchMissingNodeModulesPlugin] = findPlugin<'server'>()(
                devConfig,
                'WatchMissingNodeModulesPlugin',
            );

            WatchMissingNodeModulesPlugin.nodeModulesPath = './123';

            expect(devConfig).toMatchObject<typeof devConfig>({
                ...devConfig,
                plugins: getPlugins(
                    devConfig.plugins,
                    'WatchMissingNodeModulesPlugin',
                    (pluginOptions) => ({
                        ...pluginOptions,
                        nodeModulesPath: './123',
                    }),
                ),
            });
        });
    });
});
