// TODO: remove eslint-disable
/* eslint-disable no-param-reassign */
import React from 'react';
import { render } from 'react-dom';

import type { WindowWithModule } from '@alfalab/scripts-modules';
import { MountableModule } from '@alfalab/scripts-modules/src/module-loader/module-types';

import { PostcssFeatures } from '#/shared/postcss-features';

import './styles.css';

type ModuleType = MountableModule<Record<string, unknown>>;

const ModuleCompat: ModuleType = {
    mount: (targetNode, runParams) => {
        console.log('ModuleCompat: mount', { runParams });

        if (targetNode) {
            targetNode.innerHTML = `
  <div class="module-ModuleCompat">
    Это модуль ModuleCompat, который был загружен в режиме compat.

    <div class="primary">
      У виджета могут быть свои стили, которые автоматически будут изолированы от других стилей на странице.
      Единственное условие - виджет сам должен добавлять class="module-{ID виджета}" к корневому элементу.

      <div class="primary__footer">
        Этот текст должен быть синего цвета
      </div>
      <div id="postcss-example" />
    </div>
  </div>`;

            render(<PostcssFeatures />, document.getElementById('postcss-example'));
        }
    },
    unmount: (targetNode) => {
        console.log('ModuleCompat: cleanup');

        if (targetNode) {
            targetNode.innerHTML = '';
        }
    },
};

(window as WindowWithModule<ModuleType>).ModuleCompat = ModuleCompat;
