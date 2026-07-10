import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

import { App } from './components/app';

const targetElement = document.getElementById('react-app');
const shouldHydrate = !!targetElement?.hasChildNodes();

const root = shouldHydrate ? hydrateRoot(targetElement!, <App />) : createRoot(targetElement!);

if (process.env.NODE_ENV !== 'production' && module.hot) {
    if (!shouldHydrate) {
        root.render(<App />);
    }

    module.hot.accept('./components/app', () => {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const NextAppAssignments = require('./components/app').App;

        root.render(<NextAppAssignments />);
    });
} else if (!shouldHydrate) {
    root.render(<App />);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/assets/worker.js');
}
