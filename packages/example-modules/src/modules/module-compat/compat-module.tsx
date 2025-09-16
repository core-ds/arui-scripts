import React from 'react';

import { PostcssFeatures } from '#/shared/postcss-features';

export const CompatModule = () => (
    <div className='module-ModuleCompat'>
        Это модуль ModuleCompat, который был загружен в режиме compat.
        <div className='primary'>
            У виджета могут быть свои стили, которые автоматически будут изолированы от других
            стилей на странице. Единственное условие - виджет сам должен добавлять
            class=&quot;module-ID виджета&quot; к корневому элементу.
            <div className='primary__footer'>Этот текст должен быть синего цвета</div>
            <div id='postcss-example' />
        </div>
        <PostcssFeatures />
    </div>
);
