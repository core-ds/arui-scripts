import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';

const targetElement = document.getElementById('app');

if (process.env.NODE_ENV !== 'production' && module.hot) {
    ReactDOM.render(
        <App />,
        targetElement
    );

    module.hot.accept('./app', () => {
        let NextAppAssignments = require('./app').App;

        ReactDOM.render(
            <NextAppAssignments />,
            targetElement
        );
    });
} else {
    ReactDOM.render(
        <App />,
        targetElement
    );
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/assets/worker.js");
}
