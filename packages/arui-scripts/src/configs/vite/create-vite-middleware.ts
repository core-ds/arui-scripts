import type { Request, Response } from 'express';
import { parse } from 'node-html-parser';
import type { ViteDevServer } from 'vite';

import { htmlTemplate } from '../../templates/html.template';
import { configs } from '../app-configs';

import { viteHtmlTemplate } from './vite.html-template';
import {
    checkIfIsAssetsRequest,
    checkIfIsHtmlResponse,
    fetchDataFromServer,
    generateFakeWebpackAssets,
    processAssetsRequests,
    reloadHtmlResponse, updateHtml,
    updateHtmlResponse,
} from './vite-proxy-utils';

// Эта мидлвара проксирует запросы до сервера приложения.
// Поскольку сервер приложения не знает как правильно формировать html для vite
// мидлвара модифицирует ответ с html, удаляя из него ссылки на скрипты и вставляя сслыки, которые сгенерировал дев-сервер
// vite. Запросы за webpack-assets так же модифицируются - для вебпака их генерировал сам вебпак, тут же мы сами создаем его.
export async function createViteMiddleware(vite: ViteDevServer) {
    const template = await vite.transformIndexHtml('/', viteHtmlTemplate);
    const parsedTemplate = parse(template);
    const templateScripts = parsedTemplate.querySelectorAll('script');

    return async function viteCustomProxyMiddleware(req: Request, res: Response) {
        try {
            if (req.originalUrl === '/assets/webpack-assets.json') {
                const webpackAssets = generateFakeWebpackAssets();

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

            if (configs.clientOnly) {
                const html = updateHtml(htmlTemplate, templateScripts);

                res
                    .status(200)
                    .end(html);

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

            const {html, headers} = updateHtmlResponse(fetchRes, templateScripts);

            res
                .status(fetchRes.status)
                .set(headers)
                .end(html);

        } catch (e) {
            console.log('Vite: unable to process request', e);

            res
                .status(200)
                .end(reloadHtmlResponse)
        }
    }
}
