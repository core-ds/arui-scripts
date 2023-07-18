import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import makeTmpDir from '../util/make-tmp-dir';
import clientConfig from '../../configs/webpack.client.prod';

(async () => {
    let clientWebpackConfigs = Array.isArray(clientConfig) ? clientConfig : [clientConfig];

    const promises = clientWebpackConfigs.map(async (config, i) => {
        const tmpDir = await makeTmpDir(i.toString());

        config.plugins = [
            ...config.plugins,
            new BundleAnalyzerPlugin({
                generateStatsFile: true,
                statsFilename: config.statsOutputPath,
                analyzerPort: 'auto',
            }),
        ]
        config.output = {
            ...config.output,
            path: tmpDir,
        }
    });
    await Promise.all(promises);

    webpack(clientWebpackConfigs).run(() => {});
})();
