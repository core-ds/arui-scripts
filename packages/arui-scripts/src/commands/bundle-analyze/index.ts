import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import makeTmpDir from '../util/make-tmp-dir';
import clientConfig from '../../configs/webpack.client.prod';
import config from '../../configs/app-configs';

(async () => {
    const tmpDir = await makeTmpDir();
    const plugin = new BundleAnalyzerPlugin({
        generateStatsFile: true,
        statsFilename: config.statsOutputPath,
    });
    let clientWebpackConfig = clientConfig;
    // В случае, если у пользователя несколько конфигов для клиента - запускаем bundle analyzer только для первого
    let singleClientConfig = Array.isArray(clientConfig) ? clientConfig[0] : clientConfig;
    singleClientConfig.plugins?.push(plugin as unknown as webpack.WebpackPluginInstance);
    singleClientConfig!.output!.path = tmpDir;
    webpack(singleClientConfig).run(() => {});
})();
