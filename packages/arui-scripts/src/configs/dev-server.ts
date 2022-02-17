import path from 'path';
import configs from './app-configs';
import applyOverrides from './util/apply-overrides';
import http from "http";

const devServerConfig = applyOverrides('devServer', {
    port: configs.clientServerPort,
    liveReload: false,
    client: {
        overlay: true,
    },
    devMiddleware: {
        publicPath: `/${configs.publicPath}`,
    },
    static: [configs.serverOutputPath],
    proxy: Object.assign(configs.appPackage.proxy || {}, {
        '/**': {
            target: `http://localhost:${configs.serverPort}`,
            bypass: (req: http.IncomingMessage) => {
                const assetsRoot = path.normalize(`/${configs.publicPath}`).replace(/\\/g, '/');

                if (req?.url?.startsWith(assetsRoot)) {
                    return req.url;
                }

                return null;
            }
        }
    })
});

export default devServerConfig;
