// TODO: remove eslint-disable-next-line
/* eslint-disable no-param-reassign */
import http from 'http';
import path from 'path';

import type { ProxyConfigArray } from 'webpack-dev-server';

import applyOverrides from './util/apply-overrides';
import { configs } from './app-configs';
import { ENV_CONFIG_FILENAME } from './client-env-config';

const serverProxyConfig = {
    context: ['/**'],
    target: `http://127.0.0.1:${configs.serverPort}`,
    bypass: (req: http.IncomingMessage) => {
        const assetsRoot = path.normalize(`/${configs.publicPath}`).replace(/\\/g, '/');

        if (req?.url?.startsWith(assetsRoot)) {
            return req.url;
        }

        return null;
    },
    ...(configs.devSourceMaps && configs.devSourceMaps.includes('eval') || configs.devServerCors
        ? {
            onProxyRes: (proxyRes: http.IncomingMessage) => {
                // Для дев режима, когда мы используем в качестве соурсмапов что-то, основанное на eval - нужно
                // разрешить браузеру исполнять наш код, даже когда content-security-policy приложения не позволяет этого делать.
                if (configs.devSourceMaps && configs.devSourceMaps.includes('eval')) {
                    const cspHeader = proxyRes.headers['content-security-policy'];

                    if (
                        typeof cspHeader === 'string' &&
                        !cspHeader.includes('unsafe-eval')
                    ) {
                        proxyRes.headers['content-security-policy'] = cspHeader.replace(
                            /script-src/,
                            "script-src 'unsafe-eval'",
                        );
                    }
                }
                // если включен devServerCors, то нужно принудительно менять статус ответа на 200, чтобы
                // браузер не отклонял ответы с CORS
                if (configs.devServerCors && proxyRes.method === 'OPTIONS') {
                    proxyRes.statusCode = 200;
                }
            },
        }
        : {}),
};

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
        // dev-сервер не может корректно обработать файлы, которые лежат на уровень выше чем publicPath, а html,
        // создаваемый для client-only режима как раз такой. Так же работает и env-config.json
        writeToDisk: (filename) => filename.endsWith('.html') || filename.endsWith(ENV_CONFIG_FILENAME),
    },
    static: [configs.serverOutputPath],
    proxy: getProxyConfig(),
    headers: configs.devServerCors
        ? {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Access-Control-Allow-Methods': '*',
          }
        : {},
});

function getProxyConfig(): ProxyConfigArray {
    const proxyConfig: ProxyConfigArray = [];
    const userProxyConfig = configs.proxy;

    if (!configs.clientOnly) {
        proxyConfig.push(serverProxyConfig);
    }

    if (userProxyConfig && !Array.isArray(userProxyConfig)) {
        console.warn(
            'arui-scripts config.proxy изменил сигнатуру - теперь это должен быть массив, см https://webpack.js.org/configuration/dev-server/#devserverproxy\n',
            'Пытаемся преобразовать конфигурацию в новый вид, но если будут возникать ошибки - лучше обновить конфигурацию на проекте'
        );

        Object.keys(userProxyConfig).forEach((key) => {
            proxyConfig.push({
                context: [key],
                ...userProxyConfig[key],
            });
        });
    }

    if (Array.isArray(userProxyConfig)) {
        proxyConfig.push(...userProxyConfig);
    }

    return proxyConfig;
}

export default devServerConfig;
