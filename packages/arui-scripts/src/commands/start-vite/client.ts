import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';

import { configs } from '../../configs/app-configs';
import { createViteMiddleware } from '../../configs/vite/create-vite-middleware';
import { viteConfig } from '../../configs/vite/vite.config';
import { writeFakeWebpackAssets } from '../../configs/vite/vite-proxy-utils';

(async function startViteProxy() {
    const app = express();
    const vite = await createViteServer(viteConfig);

    app.use(vite.middlewares);

    if (configs.proxy) {
        Object.keys(configs.proxy).forEach((key) => {
            app.use(createProxyMiddleware(key, configs.proxy?.[key] as any));
        });
    }

    const customProxyMiddleware = await createViteMiddleware(vite);

    app.use('/', customProxyMiddleware);

    writeFakeWebpackAssets();

    app.listen({
        port: configs.clientServerPort,
    });

    console.log(
        `Client dev server is running:
http://localhost:${configs.clientServerPort}`
    );
})();
