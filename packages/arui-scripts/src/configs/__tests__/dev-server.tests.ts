/* eslint-disable global-require, @typescript-eslint/no-var-requires */
import { type IncomingMessage } from 'http';

import type * as DevServer from '../dev-server';

jest.mock('../util/apply-overrides', () => ({
    applyOverrides: (_key: string, value: unknown) => value,
}));
jest.mock('../client-env-config', () => ({ ENV_CONFIG_FILENAME: 'env-config.json' }));

function load(overrides: Record<string, unknown> = {}) {
    jest.resetModules();
    jest.doMock('../app-configs', () => ({
        configs: {
            publicPath: 'assets/',
            serverPort: 3000,
            clientServerPort: 8080,
            serverOutputPath: '/build',
            clientOutputPath: '/build/assets',
            clientOnly: false,
            proxy: [],
            devSourceMaps: false,
            devServerCors: false,
            ...overrides,
        },
    }));

    return (require('../dev-server') as typeof DevServer).devServerConfig;
}

describe('development proxy', () => {
    test('keeps client assets out of backend proxy and preserves user proxy priority', () => {
        const userProxy = { target: 'http://api', pathFilter: '/api' };
        const config = load({ proxy: [userProxy] });
        const proxies = config.proxy as Array<{ pathFilter: (url: string) => boolean }>;

        expect(proxies[0]).toEqual(userProxy);
        expect(proxies[1].pathFilter('/assets/main.js')).toBe(false);
        expect(proxies[1].pathFilter('/orders')).toBe(true);
        const { writeToDisk } = config.devMiddleware as {
            writeToDisk: (filename: string) => boolean;
        };

        expect(writeToDisk('/index.html')).toBe(true);
        expect(writeToDisk('/env-config.json')).toBe(true);
        expect(writeToDisk('/main.js')).toBe(false);
    });
    test('uses history fallback without backend proxy in client-only mode', () => {
        const config = load({ clientOnly: true, proxy: null });

        expect(config.proxy).toEqual([]);
        expect(config.historyApiFallback).toBe(true);
    });
    test.each([false, true])('adjusts eval CSP and CORS preflight (CORS=%s)', (cors) => {
        const config = load({ devSourceMaps: 'eval-source-map', devServerCors: cors });
        const proxy = (
            config.proxy as Array<{
                on: { proxyRes: (res: IncomingMessage, req: IncomingMessage) => void };
            }>
        )[0];
        const response = {
            headers: { 'content-security-policy': "script-src 'self'" },
            statusCode: 403,
        };

        proxy.on.proxyRes(
            response as unknown as IncomingMessage,
            { method: 'OPTIONS' } as IncomingMessage,
        );
        expect(response.headers['content-security-policy']).toBe("script-src 'unsafe-eval' 'self'");
        expect(response.statusCode).toBe(cors ? 200 : 403);
        proxy.on.proxyRes(
            response as unknown as IncomingMessage,
            { method: 'GET' } as IncomingMessage,
        );
        expect(response.headers['content-security-policy'].match(/unsafe-eval/g)).toHaveLength(1);
        proxy.on.proxyRes({ headers: {} } as IncomingMessage, { method: 'GET' } as IncomingMessage);
    });
    test('supports CORS without eval source maps', () => {
        const config = load({ devServerCors: true });

        expect(config.headers).toMatchObject({ 'Access-Control-Allow-Origin': '*' });
        const proxy = (
            config.proxy as Array<{
                on: { proxyRes: (res: IncomingMessage, req: IncomingMessage) => void };
            }>
        )[0];
        const response = { headers: {}, statusCode: 403 };

        proxy.on.proxyRes(
            response as unknown as IncomingMessage,
            { method: 'OPTIONS' } as IncomingMessage,
        );
        expect(response.statusCode).toBe(200);
    });
});
