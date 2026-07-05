import path from 'path';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';

import express from 'express';

import { readAssetsManifest } from '@alfalab/scripts-server';

import icon from './server.png';
import svgIcon from '../clock.svg';
import { App } from '#/components/app';

const app = express();

app.use('/assets', express.static(path.join(process.cwd(), '.build', 'assets')));

type AppHtmlProps = {
    children: React.ReactNode;
    styles: string[];
    scripts: string[];
}
const AppHtml = ({ children, styles, scripts }: AppHtmlProps) => (
    <html lang='en'>
        <head>
            <meta charSet='utf-8' />
            <meta name='viewport' content='width=device-width, initial-scale=1' />
            <title>My App</title>
            {styles.map((c) => <link rel='stylesheet' href={c} key={c} />)}
        </head>
        <body>
            <div id='react-app'>{children}</div>
        </body>
    </html>
);

app.get('/', async (req, res) => {
    const assets = await readAssetsManifest();

    const { pipe, abort } = renderToPipeableStream(<AppHtml scripts={assets.js} styles={assets.css}><App /></AppHtml>, {
        bootstrapScripts: assets.js,
        onShellReady() {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            pipe(res);
        },
        onShellError() {
            res.statusCode = 500;
            res.send('<h1>Error</h1>');
        },
        onError(err) {
            console.error(err);
        },
    });
    setTimeout(abort, 10000);

//     const response = `
// <html>
// <head>
// <base href="/" />
// ${assets.css.map((c) => `<link rel='stylesheet' href='/${c}' />`).join('')}
// </head>
// <body>
// <div id='react-app'></div>
//
// <p>Картинка с сервера:</p>
// <img src="${icon}" alt="Картика с сервера" width="200" />
// <img src="${svgIcon}" alt="svg с сервера" />
// ${assets.js.map((c) => `<script type='text/javascript' src='/${c}'></script>`).join('')}
// </body>
// </html>
// `;
//
//     res.send(response);
});

app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('Test server is listening on :3000');
});
