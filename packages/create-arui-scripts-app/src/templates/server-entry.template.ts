import { type TemplateContext } from '../types';

export function serverEntryTemplate(ctx: TemplateContext): string {
    const reduxImport = ctx.useRtk ? "\nimport { Provider } from 'react-redux';" : '';
    const routerImport = ctx.useRouter ? "\nimport { StaticRouter } from 'react-router';" : '';
    const storeImport = ctx.useRtk ? "\nimport { makeStore } from '../client/store';" : '';

    const renderPageFn = ctx.useRtk
        ? `function renderPage(appHtml: string, assets: Assets, preloadedState: string): string {
    const css = assets.css.map((href) => \`<link rel="stylesheet" href="/\${href}" />\`).join('');
    const js = assets.js.map((src) => \`<script src="/\${src}"></script>\`).join('');
    const state = \`<script>window.__PRELOADED_STATE__ = \${preloadedState};</script>\`;

    return \`<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8" /><base href="/" />\${css}</head><body><div id="react-app">\${appHtml}</div>\${state}\${js}</body></html>\`;
}`
        : `function renderPage(appHtml: string, assets: Assets): string {
    const css = assets.css.map((href) => \`<link rel="stylesheet" href="/\${href}" />\`).join('');
    const js = assets.js.map((src) => \`<script src="/\${src}"></script>\`).join('');

    return \`<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8" /><base href="/" />\${css}</head><body><div id="react-app">\${appHtml}</div>\${js}</body></html>\`;
}`;

    const appJsx = (() => {
        let inner = '<App />';

        if (ctx.useRtk) {
            inner = `<Provider store={store}>
                    ${inner}
                </Provider>`;
        }

        if (ctx.useRouter) {
            inner = `<StaticRouter location={location}>
                    ${inner}
                </StaticRouter>`;
        }

        return inner;
    })();

    const handlerBody = ctx.useRtk
        ? `            const assets = await readAssetsManifest();
            const store = makeStore();
            const appHtml = renderToString(
                ${appJsx},
            );
            // Экранируем символ "<", чтобы через состояние нельзя было внедрить теги в HTML
            const preloadedState = JSON.stringify(store.getState()).replace(/</g, '\\\\u003c');

            return renderPage(appHtml, assets, preloadedState);`
        : `            const assets = await readAssetsManifest();
            const appHtml = renderToString(${appJsx});

            return renderPage(appHtml, assets);`;

    const routePath = ctx.useRouter ? '/{path*}' : '/';
    const locationLine = ctx.useRouter
        ? `
            const location = request.url.pathname;`
        : '';

    return `import React from 'react';
import { renderToString } from 'react-dom/server';${reduxImport}${routerImport}
import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import path from 'node:path';

import { readAssetsManifest } from '@alfalab/scripts-server';

import { App } from '../client/components/app';${storeImport}

const PORT = ${ctx.serverPort};

type Assets = {
    css: string[];
    js: string[];
};

${renderPageFn}

async function start() {
    const server = Hapi.server({
        port: PORT,
        routes: {
            files: {
                relativeTo: path.join(process.cwd(), '.build'),
            },
        },
    });

    await server.register(Inert);

    server.route({
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: 'assets',
            },
        },
    });

    server.route({
        method: 'GET',
        path: '${routePath}',
        handler: async (${ctx.useRouter ? 'request' : ''}) => {${locationLine}
${handlerBody}
        },
    });

    await server.start();
    // eslint-disable-next-line no-console -- стартовый лог dev-сервера
    console.log(\`Server is listening on \${server.info.uri}\`);
}

void start();
`;
}
