import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { parse } from 'node-html-parser';
import { createServer as createViteServer } from 'vite';

import { configs } from '../../configs/app-configs';
import { viteConfig } from '../../configs/vite/vite.config';
import { viteHtmlTemplate } from '../../configs/vite/vite.html-template';
import {
    checkIfIsAssetsRequest,
    checkIfIsHtmlResponse,
    fetchDataFromServer,
    generateFakeWebpackAssets,
    processAssetsRequests,
    reloadHtmlResponse,
    updateHtmlResponse
} from '../../configs/vite/vite-proxy-utils';

(async function startViteProxy() {
    const app = express();
    const vite = await createViteServer(viteConfig);

    app.use(vite.middlewares);

    if (configs.proxy) {
        Object.keys(configs.proxy).forEach((key) => {
            app.use(createProxyMiddleware(key, configs.proxy?.[key] as any));
        });
    }

    const template = await vite.transformIndexHtml('/', viteHtmlTemplate);
    const parsedTemplate = parse(template);
    const templateScripts = parsedTemplate.querySelectorAll('script');

    app.use('/', async (req, res) => {
        try {
            const webpackAssets = generateFakeWebpackAssets();

            if (req.originalUrl === '/assets/webpack-assets.json') {
                res
                    .status(200)
                    .end(JSON.stringify(webpackAssets));

                return;
            }

            const isAssetsRequest = checkIfIsAssetsRequest(req);

            if (isAssetsRequest) {
                await processAssetsRequests(req, res);

                return;
            }

            const fetchRes = await fetchDataFromServer(req);
            const isHtmlResponse = checkIfIsHtmlResponse(fetchRes);

            if (!isHtmlResponse) {
                res
                    .status(fetchRes.status)
                    .set(fetchRes.headers)
                    .end(fetchRes.data);

                return;
            }

            const { responseRoot, headers } = updateHtmlResponse(fetchRes, templateScripts);

            res
                .status(fetchRes.status)
                .set(headers)
                .end(responseRoot.toString());

        } catch (e) {
            res
                .status(200)
                .end(reloadHtmlResponse)
        }
    })

    app.listen({
        port: configs.clientServerPort,
    });

    console.log(
        `Client dev server is running:
http://localhost:${configs.clientServerPort}`
    );
})();
