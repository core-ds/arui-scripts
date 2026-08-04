import { readPanelState, writePanelState } from '../panel-state';
import { countShareProblems, readShareScopes } from '../share-scope';
import { type ModulesStoreState } from '../store-client';

import { createElement } from './dom';
import { createEventsView } from './events-view';
import { createShareScopeView } from './share-scope-view';
import { createLoadsTable } from './table';
import { createTabs } from './tabs';

export type Panel = {
    /** корневой элемент панели, монтируется внутрь shadow root */
    element: HTMLElement;
    /** перерисовывает панель под новое состояние стора */
    update(state: ModulesStoreState): void;
    destroy(): void;
};

export type CreatePanelOptions = {
    onClose(): void;
};

/** Панель: шапка, вкладки, строка состояния и содержимое активной вкладки. */
export function createPanel({ onClose }: CreatePanelOptions): Panel {
    const element = createElement('div', 'panel');

    element.setAttribute('role', 'complementary');
    element.setAttribute('aria-label', 'arui devtools');

    const header = createElement('div', 'header');
    const title = createElement('div', 'title', 'arui devtools');
    const close = createElement('button', 'button button_icon close', '✕');

    close.type = 'button';
    close.title = 'Закрыть (Esc)';
    close.setAttribute('aria-label', 'Закрыть панель');
    close.addEventListener('click', onClose);

    header.appendChild(title);
    header.appendChild(close);

    const status = createElement('div', 'status');
    const table = createLoadsTable();
    const events = createEventsView();
    const shareScope = createShareScopeView();
    const tabs = createTabs(
        [
            { id: 'modules', title: 'Модули', content: table.element },
            { id: 'events', title: 'События', content: events.element },
            {
                id: 'share-scope',
                title: 'Share scope',
                content: shareScope.element,
                // скоуп меняется по ходу загрузки модулей, а подписаться на него не на что -
                // пересобираем снимок в момент открытия вкладки
                onShow: () => shareScope.refresh(),
            },
        ],
        {
            activeId: readPanelState().tab,
            onChange: (tab) => writePanelState({ tab }),
        },
    );

    element.appendChild(header);
    element.appendChild(tabs.header);
    element.appendChild(status);
    element.appendChild(tabs.body);

    function update(state: ModulesStoreState) {
        status.classList.toggle('status_error', state.status === 'unsupported');

        // проблемы скоупа считаем всегда: про них надо знать, даже не открывая вкладку
        const problems = countShareProblems(readShareScopes());

        tabs.setNote('share-scope', problems ? `проблем: ${problems}` : '');

        // Пока вкладка открыта, её надо и обновлять: иначе в теле навсегда остаётся снимок
        // на момент открытия - вплоть до «Share scope пуст» рядом с ярлыком «проблем: 1».
        // Закрытую вкладку не трогаем, её пересоберёт onShow.
        if (tabs.isActive('share-scope')) {
            shareScope.refresh();
        }

        if (state.status === 'unsupported') {
            status.textContent = `Стор devtools версии ${state.found}, панель умеет читать ${state.supported}. Обновите @alfalab/scripts-devtools или @alfalab/scripts-modules.`;
            table.update([]);
            events.update([]);

            return;
        }

        if (state.status === 'waiting') {
            status.textContent = 'Ждём загрузчик модулей: ни один модуль ещё не загружался.';
            table.update([]);
            events.update([]);

            return;
        }

        const { loads, events: snapshotEvents } = state.snapshot;

        status.textContent = `Загрузок: ${loads.length} · событий: ${snapshotEvents.length}`;
        table.update(loads);
        events.update(snapshotEvents);
    }

    return {
        element,
        update,
        destroy() {
            close.removeEventListener('click', onClose);
            element.remove();
        },
    };
}
