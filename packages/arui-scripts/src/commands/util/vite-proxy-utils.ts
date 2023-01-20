import axios, { AxiosResponse } from 'axios/index';
import { Request, Response } from 'express-serve-static-core';
import fs from 'fs';
import configs from '../../configs/app-configs';
import { HTMLElement, parse } from 'node-html-parser';
import path from 'path';

// Обработчик запросов за статичными ассетами, сгенеренными серверным бандлом (favicon и тд)
export function processAssetsRequests(req: Request, res: Response) {
    const fileReadStream = fs.createReadStream(`${configs.serverOutputPath}${req.originalUrl}`);

    fileReadStream.pipe(res);
}

// Получает данные из оригинального сервера, фактически проксируя текущий запрос
export async function fetchDataFromServer(req: Request) {
    return axios(`http://localhost:${configs.serverPort}${req.originalUrl}`, {
        headers: req.headers,
        method: req.method,
        data: req,
        maxRedirects: 0,
        responseType: 'text',
        transformResponse: (res) => {
            // нам не нужно парсить ответ, если вернулся json - оставляем его просто как строку
            return res;
        },
        validateStatus: function (status) {
            // все ответы считаем валидными, нам достаточно просто проксировать статус как есть
            return true;
        }
    });
}

// Вставляет в html, полученный от ssr корректные ссылки на скрипты для подключения js.
export function updateHtmlResponse(fetchRes: AxiosResponse, templateScripts: HTMLElement[]) {
    const responseRoot = parse(fetchRes.data);
    const scripts = responseRoot.querySelectorAll('script');

    let nonce: string | undefined = undefined;
    scripts.forEach((appScript) => {
        // Удаляем из ответа ссылку на фейковый js файл
        if (appScript.getAttribute('src') === 'fake.js') {
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
    fs.writeFileSync(
        path.join(configs.cwd, configs.buildPath, 'webpack-assets.json'),
        JSON.stringify({
                "main": {
                    "js": ["fake.js"]
                }
            }
        ),
        'utf8',
    );
}
