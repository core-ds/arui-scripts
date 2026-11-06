import React from 'react';

import { Button } from '@alfalab/core-components/button';

import { PostcssFeatures } from '#/shared/postcss-features';

import './styles.css';

export const Module = () => (
    <div>
        <h1>Модуль, загруженный через module-federation</h1>
        <PostcssFeatures />
        <p>
            Виджеты никак не ограничены в использовании каких либо библиотек. В этом примере мы
            используем react для рендринга виджета.
        </p>
        <Button view='accent'>Hello</Button>
        <p className='module-shadow-dom-style'>Проверка стилей через shadow-dom</p>
    </div>
);
