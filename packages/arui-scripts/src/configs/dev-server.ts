import path from 'path';
import http from 'http';
import configs from './app-configs';
import applyOverrides from './util/apply-overrides';

const devServerConfig = applyOverrides('devServer', {
    port: configs.clientServerPort,
    liveReload: false,
    client: {
        overlay: {
            errors: true,
            warnings: false,
        },
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
            },
            // Для дев режима, когда мы используем в качестве соурсмапов что-то, основанное на eval - нужно
            // разрешить браузеру исполнять наш код, даже когда content-security-policy приложения не позволяет этого делать.
            ...(configs.devSourceMaps.includes('eval') ? {
                onProxyRes: (proxyRes: http.IncomingMessage) => {
                    const cspHeader = proxyRes.headers['content-security-policy'];
                    if (cspHeader && !cspHeader.includes('unsafe-eval') && typeof cspHeader === 'string') {
                        proxyRes.headers['content-security-policy'] = cspHeader
                            .replace(/script-src/, "script-src 'unsafe-eval'");
                    }
                }
            } : {}),
        }
    })
});

export default devServerConfig;
