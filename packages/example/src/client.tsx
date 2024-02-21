import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';

import { Routes } from './components/routes';

const targetElement = document.getElementById('app');
const history = createBrowserHistory();

ReactDOM.render(
    <Router history={history}><Routes /></Router>,
    targetElement
);
