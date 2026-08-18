import { PANEL_BRIDGE_KEY } from '../constants';
import { type PanelVisibility } from '../types';

type Listener = (visible: boolean) => void;

type GlobalWithBridge = Record<string, unknown>;

/**
 * Показана ли вкладка панели, и мост, по которому об этом сообщают.
 *
 * Знает о показе только страница devtools: `panel.onShown`/`onHidden` есть у объекта вкладки,
 * а он существует там. Оба документа принадлежат одному расширению, поэтому мост прямой -
 * postMessage тут был бы лишним посредником.
 *
 * Фабрика, а не готовый синглтон: состояние живёт внутри, и тесту нужен свой экземпляр.
 */
export function createPanelVisibility(): PanelVisibility & {
    install(target?: GlobalWithBridge): void;
} {
    const listeners = new Set<Listener>();
    /*
     * Панель считается показанной, пока не сказали обратное. Документ панели создаётся браузером
     * в момент первого показа вкладки, и первое `onShown` вполне может прийти раньше, чем мост
     * встанет на место: пропущенное «показана» так ничего не меняет, а «спрятана» приходит позже,
     * когда мост уже есть.
     */
    let visible = true;

    function setVisible(next: boolean) {
        if (next === visible) {
            return;
        }

        visible = next;
        listeners.forEach((listener) => {
            try {
                listener(next);
            } catch {
                // один подписчик не должен ломать остальных
            }
        });
    }

    return {
        isVisible: () => visible,

        subscribe(listener) {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },

        install(target: GlobalWithBridge = globalThis) {
            try {
                // записать себя в чужой объект - это и есть мост: страница devtools ищет
                // панель по этому ключу, другого способа к ней обратиться у неё нет
                // eslint-disable-next-line no-param-reassign
                target[PANEL_BRIDGE_KEY] = { setVisible };
            } catch {
                // не смогли - панель просто продолжит опрашивать страницу всегда, как раньше
            }
        },
    };
}

/** видимость этой панели: её ставит энтрипоинт и читает источник данных */
export const panelVisibility = createPanelVisibility();
