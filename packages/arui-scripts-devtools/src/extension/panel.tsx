import { createRoot } from 'react-dom/client';

import { PanelApp } from '../panel/panel-app';

import { createExtensionSource } from './source';
import { panelVisibility } from './visibility';

import PANEL_STYLES from '../panel/styles.css';
import EXTENSION_STYLES from './panel-styles.css';

/**
 * Энтрипоинт вкладки DevTools.
 *
 * Панель монтируется в shadow root, хотя изолировать её тут не от чего: документ наш целиком.
 * Так у стилей остаётся один путь на оба применения - `:host` с токенами работает как есть,
 * и расширению достаётся ровно та же панель, что и странице.
 *
 * Мост видимости открываем первым делом: страница devtools зовёт его из `panel.onShown`,
 * а тот может прийти сразу за созданием документа.
 */
panelVisibility.install();

const host = document.createElement('div');
const shadow = host.attachShadow({ mode: 'open' });
const style = document.createElement('style');

style.textContent = `${PANEL_STYLES}\n${EXTENSION_STYLES}`;
shadow.appendChild(style);

const container = document.createElement('div');

// высоту тянем через всю цепочку: panel.html -> хост -> этот контейнер -> сама панель
container.className = 'root';
shadow.appendChild(container);
document.body.appendChild(host);

// onClose не передаём: закрыть вкладку DevTools можно только средствами самих DevTools
createRoot(container).render(<PanelApp source={createExtensionSource()} />);
