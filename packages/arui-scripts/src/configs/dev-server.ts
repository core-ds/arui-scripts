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
    proxy: Object.assign(configs.proxy || {}, {
        '/**': {
            target: `http://localhost:${configs.serverPort}`,
            bypass: (req: http.IncomingMessage) => {
                const assetsRoot = path.normalize(`/${configs.publicPath}`).replace(/\\/g, '/');

                if (req?.url?.startsWith(assetsRoot)) {
                    return req.url;
                }

                return null;
            },
            ...(configs.devSourceMaps.includes('eval') || configs.devServerCors ? {
                onProxyRes: (proxyRes: http.IncomingMessage) => {
                    // Для дев режима, когда мы используем в качестве соурсмапов что-то, основанное на eval - нужно
                    // разрешить браузеру исполнять наш код, даже когда content-security-policy приложения не позволяет этого делать.
                    if (configs.devSourceMaps.includes('eval')) {
                        const cspHeader = proxyRes.headers['content-security-policy'];
                        if (typeof cspHeader === 'string' && !cspHeader.includes('unsafe-eval')) {
                            proxyRes.headers['content-security-policy'] = cspHeader
                                .replace(/script-src/, 'script-src \'unsafe-eval\'');
                        }
                    }
                    // если включен devServerCors, то нужно принудительно менять статус ответа на 200, чтобы
                    // браузер не отклонял ответы с CORS
                    if (configs.devServerCors && proxyRes.method === 'OPTIONS') {
                        proxyRes.statusCode = 200;
                    }
                },
            } : {}),
        },
    }),
    headers: configs.devServerCors
        ? {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
        }
        : {},
});

export default devServerConfig;
