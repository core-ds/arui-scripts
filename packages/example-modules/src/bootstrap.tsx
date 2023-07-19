import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/app';

const targetElement = document.getElementById('app');

if (process.env.NODE_ENV !== 'production' && module.hot) {
    ReactDOM.render(
        <App />,
        targetElement
    );

    module.hot.accept('./components/app', () => {
        let NextAppAssignments = require('./components/app').App;

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
