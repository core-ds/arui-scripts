import { type ExtensionPanel, getChromeApi, type PanelWindow } from './chrome-api';

/**
 * Энтрипоинт `devtools_page`: завести вкладку в DevTools и сказать ей, когда её видно.
 *
 * Сама панель живёт в отдельном документе (`panel.html`) и создаётся браузером только когда
 * пользователь на эту вкладку переключится.
 *
 * Про показ и скрытие знает только эта страница: `panel.onShown`/`onHidden` есть у объекта
 * вкладки, а он существует здесь. Панели это нужно, чтобы не опрашивать инспектируемую
 * страницу, пока её никто не смотрит.
 */
const panels = getChromeApi()?.devtools?.panels;

function notify(panelWindow: PanelWindow | undefined, visible: boolean) {
    try {
        panelWindow?.__ARUI_DEVTOOLS_PANEL__?.setVisible(visible);
    } catch {
        // документ панели мог уже закрыться - это не повод падать в консоль DevTools
    }
}

panels?.create('ARUI', 'icons/icon-32.png', 'panel.html', (panel: ExtensionPanel) => {
    // `onHidden` приходит пустым: окно панели запоминаем с первого показа
    let panelWindow: PanelWindow | undefined;

    panel?.onShown?.addListener((shownWindow) => {
        panelWindow = shownWindow;
        notify(panelWindow, true);
    });

    panel?.onHidden?.addListener(() => notify(panelWindow, false));
});
