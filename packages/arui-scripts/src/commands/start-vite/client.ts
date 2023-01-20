import express from 'express';
import configs from '../../configs/app-configs';
import { createServer as createViteServer } from 'vite';
import { parse } from 'node-html-parser';
import { viteConfig } from '../../configs/vite.config';
import { viteHtmlTemplate } from '../../configs/vite.html-template';
import { startHttp2ProxyServer } from '../util/start-http2-proxy-server';
import {
    checkIfIsAssetsRequest,
    checkIfIsHtmlResponse,
    fetchDataFromServer,
    generateFakeWebpackAssets,
    processAssetsRequests, reloadHtmlResponse,
    updateHtmlResponse
} from '../util/vite-proxy-utils';

(async function() {
    const app = express();
    const vite = await createViteServer(viteConfig);

    app.use(vite.middlewares);

    const template = await vite.transformIndexHtml('/', viteHtmlTemplate);
    const parsedTemplate = parse(template);
    const templateScripts = parsedTemplate.querySelectorAll('script');

    app.use('/', async (req, res) => {
        try {
            generateFakeWebpackAssets();
        } catch (e) {
            res
                .status(200)
                .end(reloadHtmlResponse)
            return
        }
        const isAssetsRequest = checkIfIsAssetsRequest(req);

        if (isAssetsRequest) {
            processAssetsRequests(req, res);

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
    })

    app.listen({
        port: configs.viteDevPort,
    });
})();

startHttp2ProxyServer({
    originalPort: configs.viteDevPort,
    originalHost: 'localhost',
    port: configs.clientServerPort,
});
