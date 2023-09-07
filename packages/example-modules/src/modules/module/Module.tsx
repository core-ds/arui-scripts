import React from 'react';
import { PostcssFeatures } from '#/shared/postcss-features';

export const Module = () => (
    <div>
        <h1>Модуль, загруженный через module-federation</h1>
        <PostcssFeatures />
        <p>
            Виджеты никак не ограничены в использовании каких либо библиотек. В этом примере мы используем
            react для рендринга виджета.
        </p>
    </div>
);
