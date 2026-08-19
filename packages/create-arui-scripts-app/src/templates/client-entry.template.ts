import { type TemplateContext } from '../types';

function wrapWithRouter(jsx: string, ctx: TemplateContext): string {
    if (!ctx.useRouter) {
        return jsx;
    }

    return `<BrowserRouter>${jsx}</BrowserRouter>`;
}

function fromEntry(ctx: TemplateContext, target: string): string {
    return ctx.dualEntries ? `../${target}` : `./${target}`;
}

function hmrBlock(ctx: TemplateContext): string {
    const appPath = fromEntry(ctx, 'components/app');

    return `if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('${appPath}', () => {
        const mod = require('${appPath}') as { App: typeof App };

        render(mod.App);
    });
}
`;
}

export function clientEntryTemplate(ctx: TemplateContext): string {
    return ctx.clientOnly ? clientOnlyEntryTemplate(ctx) : ssrEntryTemplate(ctx);
}

function routerImport(ctx: TemplateContext): string {
    return ctx.useRouter ? "\nimport { BrowserRouter } from 'react-router-dom';" : '';
}

function ssrEntryTemplate(ctx: TemplateContext): string {
    const appImport = fromEntry(ctx, 'components/app');
    const storeImport = fromEntry(ctx, 'store');

    if (ctx.useRtk) {
        const appTree = wrapWithRouter(
            `
        <Provider store={store}>
            <App />
        </Provider>`,
            ctx,
        );

        return `import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';${routerImport(ctx)}

import { App } from '${appImport}';
import { makeStore, type RootState } from '${storeImport}';

declare global {
    interface Window {
        __PRELOADED_STATE__?: Partial<RootState>;
    }
}

const store = makeStore(window.__PRELOADED_STATE__);
const targetElement = document.getElementById('react-app');

const root = hydrateRoot(
    targetElement!,${appTree},
);

function render(AppComponent: typeof App) {
    root.render(${wrapWithRouter(
        `
        <Provider store={store}>
            <AppComponent />
        </Provider>`,
        ctx,
    )},
    );
}

${hmrBlock(ctx)}`;
    }

    const appTree = wrapWithRouter('<App />', ctx);

    return `import React from 'react';
import { hydrateRoot } from 'react-dom/client';${routerImport(ctx)}

import { App } from '${appImport}';

const targetElement = document.getElementById('react-app');
const root = hydrateRoot(targetElement!, ${appTree});

function render(AppComponent: typeof App) {
    root.render(${wrapWithRouter('<AppComponent />', ctx)});
}

${hmrBlock(ctx)}`;
}

function clientOnlyEntryTemplate(ctx: TemplateContext): string {
    const appImport = fromEntry(ctx, 'components/app');
    const storeImport = fromEntry(ctx, 'store');

    if (ctx.useRtk) {
        return `import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';${routerImport(ctx)}

import { App } from '${appImport}';
import { makeStore } from '${storeImport}';

const store = makeStore();
const targetElement = document.getElementById('react-app');
const root = createRoot(targetElement!);

function render(AppComponent: typeof App) {
    root.render(${wrapWithRouter(
        `
        <Provider store={store}>
            <AppComponent />
        </Provider>`,
        ctx,
    )},
    );
}

render(App);

${hmrBlock(ctx)}`;
    }

    return `import React from 'react';
import { createRoot } from 'react-dom/client';${routerImport(ctx)}

import { App } from '${appImport}';

const targetElement = document.getElementById('react-app');
const root = createRoot(targetElement!);

function render(AppComponent: typeof App) {
    root.render(${wrapWithRouter('<AppComponent />', ctx)});
}

render(App);

${hmrBlock(ctx)}`;
}
