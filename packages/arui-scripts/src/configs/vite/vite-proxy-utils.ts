import fs from 'fs';
import path from 'path';

import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express-serve-static-core';
import { HTMLElement, parse } from 'node-html-parser';

import { configs } from '../app-configs';

// Обработчик запросов за статичными ассетами, сгенеренными серверным бандлом (favicon и тд)
export async function processAssetsRequests(req: Request, res: Response) {
    const isFileExists = await fs.promises.stat(`${ configs.serverOutputPath }${ req.originalUrl }`).catch(() => false);

    if (!isFileExists) {
        res.status(404).end();

        return;
    }
    try {
        const fileReadStream = fs.createReadStream(`${ configs.serverOutputPath }${ req.originalUrl }`);

        fileReadStream.pipe(res);
    } catch (e) {
        res.status(404).end();
    }
}

// Получает данные из оригинального сервера, фактически проксируя текущий запрос
export async function fetchDataFromServer(req: Request) {
    return axios(`http://localhost:${configs.serverPort}${req.originalUrl}`, {
        headers: req.headers,
        method: req.method,
        data: req,
        maxRedirects: 0,
        responseType: 'text',
        transformResponse: (res) =>
            // нам не нужно парсить ответ, если вернулся json - оставляем его просто как строку
             res
        ,
        validateStatus () {
            // все ответы считаем валидными, нам достаточно просто проксировать статус как есть
            return true;
        }
    });
}

// Вставляет в html, полученный от ssr корректные ссылки на скрипты для подключения js.
export function updateHtmlResponse(fetchRes: AxiosResponse, templateScripts: HTMLElement[]) {
    const responseRoot = parse(fetchRes.data);
    const scripts = responseRoot.querySelectorAll('script');

    let nonce: string | undefined;

    scripts.forEach((appScript) => {
        // Удаляем из ответа ссылку на фейковый js файл
        if (appScript.getAttribute('src')?.endsWith('fake.js')) {
            appScript.parentNode.removeChild(appScript);
        }
        // Если приложение проставляет скриптам nonce тег - сохраняем его себе, чтобы поставить новым скриптам
        if (appScript.getAttribute('nonce')) {
            nonce = appScript.getAttribute('nonce');
        }
    });

    const headElement = responseRoot.querySelector('head');

    templateScripts.forEach((templateScript) => {
        if (nonce) {
            templateScript.setAttribute('nonce', nonce);
        }
        headElement?.appendChild(templateScript);
    })

    const headers = {
        ...fetchRes.headers,
    };

    delete headers['content-length'];

    return { responseRoot, headers };
}

// Проверят, является ли полученный ответ от сервера html
export function checkIfIsHtmlResponse(fetchRes: AxiosResponse) {
    return (fetchRes.status < 300 || fetchRes.status >= 400)
        && fetchRes.headers['content-type'] && fetchRes.headers['content-type'].indexOf('html') !== -1;
}

// Проверяет, является ли запрос - запросом за статичными ассетами
export function checkIfIsAssetsRequest(req: Request) {
    return req.originalUrl.startsWith(`/${configs.assetsPath}/`);
}

// Создает фейковый файл с webpack-assets, который сможет использовать сервер приложения
export function generateFakeWebpackAssets() {
    const assetsContent: Record<string, any> = {
        main: {
            js: ['fake.js']
        },
        __metadata__: {
            version: configs.appPackage.version,
            name: configs.normalizedName,
            vite: true,
        },
    }

    if (configs.modules?.exposes) {
        Object.keys(configs.modules.exposes).forEach((name) => {
            assetsContent[name] = {
                mode: 'default',
                js: configs.modules?.exposes?.[name],
            };
        });
    }

    if (configs.compatModules?.exposes) {
        Object.keys(configs.compatModules.exposes).forEach((name) => {
            assetsContent[name] = {
                js: configs.compatModules?.exposes?.[name].entry,
            };
        });
    }
    const content = JSON.stringify(assetsContent);

    fs.writeFileSync(
        path.join(configs.cwd, configs.buildPath, 'webpack-assets.json'),
        content,
        'utf8',
    );

    return assetsContent;
}

export const reloadHtmlResponse = `<html>
<script type="text/javascript">setTimeout(() => {window.location.reload()}, 1000)</script>
<body>
    <h1>Getting things ready...</h1>
</body>
</html>`;
