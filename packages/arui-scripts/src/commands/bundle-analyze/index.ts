import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { rspack, type WebpackPluginInstance } from '@rspack/core';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { configs } from '../../configs/app-configs';
import { webpackClientConfig } from '../../configs/webpack.client.prod';
import { makeTmpDir } from '../util/make-tmp-dir';

(async () => {
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
            }) as unknown as WebpackPluginInstance, // webpack-bundle-analyzer has incorrect types
            new RsdoctorRspackPlugin({}),
        ];
        webpackConfig.output = {
            ...webpackConfig.output,
            path: tmpDir,
        };
    });

    await Promise.all(promises);

    rspack(clientWebpackConfigs).run(() => {});
})();
