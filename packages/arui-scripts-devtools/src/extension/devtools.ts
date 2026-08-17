import { getChromeApi } from './chrome-api';

/**
 * Энтрипоинт `devtools_page`: единственная его задача - завести вкладку в DevTools.
 *
 * Сама панель живёт в отдельном документе (`panel.html`) и создаётся браузером только когда
 * пользователь на эту вкладку переключится.
 */
const panels = getChromeApi()?.devtools?.panels;

panels?.create('ARUI', 'icons/icon-32.png', 'panel.html');
