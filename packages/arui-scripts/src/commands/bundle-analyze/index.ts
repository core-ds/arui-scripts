import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import makeTmpDir from '../util/make-tmp-dir';
import clientConfig from '../../configs/webpack.client.prod';
import configs from "../../configs/app-configs";

(async () => {
    let clientWebpackConfigs = Array.isArray(clientConfig) ? clientConfig : [clientConfig];

    const promises = clientWebpackConfigs.map(async (webpackConfig, i) => {
        const tmpDir = await makeTmpDir(i.toString());

        webpackConfig.plugins = [
            ...(webpackConfig.plugins || []),
            new BundleAnalyzerPlugin({
                generateStatsFile: true,
                statsFilename: configs.statsOutputPath,
                analyzerPort: 'auto',
            }),
        ]
        webpackConfig.output = {
            ...webpackConfig.output,
            path: tmpDir,
        }
    });
    await Promise.all(promises);

    webpack(clientWebpackConfigs).run(() => {});
})();
