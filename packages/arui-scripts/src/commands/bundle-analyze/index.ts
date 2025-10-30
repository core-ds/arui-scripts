import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { type WebpackPluginInstance, rspack } from '@rspack/core';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { configs } from '../../configs/app-configs';
import { webpackClientConfig } from '../../configs/webpack.client.prod';
import { makeTmpDir } from '../util/make-tmp-dir';

(async () => {
    console.log('Starting bundle analysis...');

    const clientWebpackConfigs = Array.isArray(webpackClientConfig)
        ? webpackClientConfig
        : [webpackClientConfig];

    /* eslint-disable no-param-reassign */
    const promises = clientWebpackConfigs.map(async (webpackConfig, i) => {
        const tmpDir = await makeTmpDir(i.toString());

        webpackConfig.plugins = [
            ...(webpackConfig.plugins || []),
            new BundleAnalyzerPlugin({
                generateStatsFile: true,
                statsFilename: configs.statsOutputPath,
                analyzerPort: 'auto',
                analyzerMode: 'server',
                openAnalyzer: true,
                logLevel: 'info',
            }) as unknown as WebpackPluginInstance, // webpack-bundle-analyzer has incorrect types
            new RsdoctorRspackPlugin({}),
        ];
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
