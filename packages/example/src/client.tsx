// TODO: remove eslint-disable-next-line
import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './components/app';

const targetElement = document.getElementById('react-app');

if (process.env.NODE_ENV !== 'production' && module.hot) {
    ReactDOM.render(<App />, targetElement);

    module.hot.accept('./components/app', () => {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        const NextAppAssignments = require('./components/app').App;

        ReactDOM.render(<NextAppAssignments />, targetElement);
    });
} else {
    ReactDOM.render(<App />, targetElement);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/assets/worker.js');
}
