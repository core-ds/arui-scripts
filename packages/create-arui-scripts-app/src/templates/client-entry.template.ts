import { type TemplateContext } from '../types';

const HMR_BLOCK = `if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./components/app', () => {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const NextApp = require('./components/app').App;

        render(NextApp);
    });
}
`;

export function clientEntryTemplate(ctx: TemplateContext): string {
    return ctx.clientOnly ? clientOnlyEntryTemplate(ctx) : ssrEntryTemplate(ctx);
}

function ssrEntryTemplate(ctx: TemplateContext): string {
    if (ctx.useRtk) {
        return `import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

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
    targetElement!,
    <Provider store={store}>
        <App />
    </Provider>,
);

function render(AppComponent: typeof App) {
    root.render(
        <Provider store={store}>
            <AppComponent />
        </Provider>,
    );
}

${HMR_BLOCK}`;
    }

    return `import React from 'react';
import { hydrateRoot } from 'react-dom/client';

import { App } from './components/app';

const targetElement = document.getElementById('react-app');
const root = hydrateRoot(targetElement!, <App />);

function render(AppComponent: typeof App) {
    root.render(<AppComponent />);
}

${HMR_BLOCK}`;
}

function clientOnlyEntryTemplate(ctx: TemplateContext): string {
    if (ctx.useRtk) {
        return `import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { App } from './components/app';
import { makeStore } from './store';

const store = makeStore();
const targetElement = document.getElementById('react-app');
const root = createRoot(targetElement!);

function render(AppComponent: typeof App) {
    root.render(
        <Provider store={store}>
            <AppComponent />
        </Provider>,
    );
}

render(App);

${HMR_BLOCK}`;
    }

    return `import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './components/app';

const targetElement = document.getElementById('react-app');
const root = createRoot(targetElement!);

function render(AppComponent: typeof App) {
    root.render(<AppComponent />);
}

render(App);

${HMR_BLOCK}`;
}
