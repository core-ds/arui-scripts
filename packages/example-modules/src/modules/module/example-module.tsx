import React from 'react';
import { Route, Router, Switch } from 'react-router';
import { History } from 'history';
import { Link as RouterLink } from 'react-router-dom';

import { PostcssFeatures } from '#/shared/postcss-features';

import './styles.css';

type Props = {
    history: History
};

export const Module = (props: Props) => (
    <Router history={props.history}>
        <RouterLink to="/" style={{ paddingRight: 16 }}>Home</RouterLink>
        <RouterLink to="/example">Module routing example</RouterLink>

        <Switch>
            <Route path="/" exact={ true }>
                <div>
                    <h1>Модуль, загруженный через module-federation</h1>
                    <PostcssFeatures/>
                    <p>
                        Виджеты никак не ограничены в использовании каких либо библиотек. В этом примере мы
                        используем react для рендринга виджета.
                    </p>

                    <p className='module-shadow-dom-style'>Проверка стилей через shadow-dom</p>
                </div>
            </Route>

            <Route path="/example">
                <div>
                    <h1>Модуль, загруженный через module-federation</h1>
                    <p>Пример роутинга в модуле</p>
                </div>
            </Route>
        </Switch>


    </Router>
);
