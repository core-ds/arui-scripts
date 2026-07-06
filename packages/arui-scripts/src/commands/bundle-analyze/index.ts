import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { rspack, type RspackOptionsNormalized, type WebpackPluginInstance } from '@rspack/core';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { configs } from '../../configs/app-configs';
import { webpackClientConfig } from '../../configs/webpack.client.prod';
import { makeTmpDir } from '../util/make-tmp-dir';

type BundleAnalyzerStatsOptions = {
    assets: boolean;
    chunks: boolean;
    chunkGroups: boolean;
    chunkModules: boolean;
    entryPoints: boolean;
    entrypoints: boolean;
    modules: boolean;
};

// В rspack по умолчанию больше не включаются эти поля, но для webpack-bundle-analyzer они нужны
// https://rspack.rs/guide/migration/rspack_1.x#changed-default-parameters-of-statstojson
const bundleAnalyzerStatsOptions: BundleAnalyzerStatsOptions = {
    assets: true,
    chunks: true,
    chunkGroups: true,
    chunkModules: true,
    entryPoints: true,
    entrypoints: true,
    modules: true,
};

(async () => {
    console.log('Starting bundle analysis...');

    const clientWebpackConfigs = Array.isArray(webpackClientConfig)
        ? webpackClientConfig
        : [webpackClientConfig];

    /* eslint-disable no-param-reassign */
    const promises = clientWebpackConfigs.map(async (webpackConfig, i) => {
        const tmpDir = await makeTmpDir(i.toString());
        const webpackStatsOptions: RspackOptionsNormalized['stats'] = {
            ...(typeof webpackConfig.stats === 'object' ? webpackConfig.stats : {}),
            ...bundleAnalyzerStatsOptions,
        };

        webpackConfig.plugins = [
            ...(webpackConfig.plugins || []),
            new BundleAnalyzerPlugin({
                generateStatsFile: true,
                statsFilename: configs.statsOutputPath,
                statsOptions: bundleAnalyzerStatsOptions,
                analyzerPort: 'auto',
                analyzerMode: 'server',
                openAnalyzer: true,
                logLevel: 'info',
            }) as unknown as WebpackPluginInstance, // webpack-bundle-analyzer has incorrect types
            new RsdoctorRspackPlugin({}),
        ];
        webpackConfig.stats = webpackStatsOptions;
        webpackConfig.output = {
            ...webpackConfig.output,
            path: tmpDir,
        };
    });

    await Promise.all(promises);

    rspack(clientWebpackConfigs).run((err, stats) => {
        if (err) {
            console.error('Bundle analysis failed with error: ', err);
            process.exit(1);
        }

        if (stats) {
            const hasErrors = stats.hasErrors?.();
            const hasWarnings = stats.hasWarnings?.();

            if (hasErrors || hasWarnings) {
                console.log(
                    stats.toString({
                        colors: true,
                        chunks: false,
                        modules: false,
                        children: false,
                        warnings: true,
                        errors: true,
                    }) as unknown as string,
                );
            }
        }
    });
})();
