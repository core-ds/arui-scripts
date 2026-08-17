import { type TemplateContext } from '../types';

const HMR_BLOCK = `if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./components/app', () => {
        const mod = require('./components/app') as { App: typeof App };

        render(mod.App);
    });
}
`;

function wrapWithRouter(jsx: string, ctx: TemplateContext): string {
    if (!ctx.useRouter) {
        return jsx;
    }

    return `<BrowserRouter>${jsx}</BrowserRouter>`;
}

export function clientEntryTemplate(ctx: TemplateContext): string {
    return ctx.clientOnly ? clientOnlyEntryTemplate(ctx) : ssrEntryTemplate(ctx);
}

function routerImport(ctx: TemplateContext): string {
    return ctx.useRouter ? "\nimport { BrowserRouter } from 'react-router-dom';" : '';
}

function ssrEntryTemplate(ctx: TemplateContext): string {
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

import { App } from './components/app';
import { makeStore, type RootState } from './store';

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

${HMR_BLOCK}`;
    }

    const appTree = wrapWithRouter('<App />', ctx);

    return `import React from 'react';
import { hydrateRoot } from 'react-dom/client';${routerImport(ctx)}

import { App } from './components/app';

const targetElement = document.getElementById('react-app');
const root = hydrateRoot(targetElement!, ${appTree});

function render(AppComponent: typeof App) {
    root.render(${wrapWithRouter('<AppComponent />', ctx)});
}

${HMR_BLOCK}`;
}

function clientOnlyEntryTemplate(ctx: TemplateContext): string {
    if (ctx.useRtk) {
        return `import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';${routerImport(ctx)}

import { App } from './components/app';
import { makeStore } from './store';

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

${HMR_BLOCK}`;
    }

    return `import React from 'react';
import { createRoot } from 'react-dom/client';${routerImport(ctx)}

import { App } from './components/app';

const targetElement = document.getElementById('react-app');
const root = createRoot(targetElement!);

function render(AppComponent: typeof App) {
    root.render(${wrapWithRouter('<AppComponent />', ctx)});
}

render(App);

${HMR_BLOCK}`;
}
