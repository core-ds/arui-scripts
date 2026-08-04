import { type DevtoolsEvent } from '../contract';
import { isFromPreviousPageLoad } from '../resource-timing';

import { createElement } from './dom';
import { EMPTY, formatDuration } from './format';

export type EventsView = {
    element: HTMLElement;
    update(events: DevtoolsEvent[]): void;
};

const COLUMNS = ['Время', 'Событие', 'Модуль', 'Стадия', 'Сообщение'];

function matches(event: DevtoolsEvent, query: string) {
    if (!query) {
        return true;
    }

    return [event.moduleId, event.type, event.stage, event.message]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
}

function createHeader() {
    const header = createElement('div', 'row row_event row_header');

    COLUMNS.forEach((title) => header.appendChild(createElement('span', 'cell', title)));

    return header;
}

function createRow(event: DevtoolsEvent) {
    const row = createElement('div', `row row_event${event.type === 'error' ? ' row_error' : ''}`);

    row.appendChild(
        createElement(
            'span',
            'cell cell_mono',
            // время от начала загрузки страницы; у записей прошлой загрузки своё начало отсчёта
            isFromPreviousPageLoad(event.timestamp) ? EMPTY : formatDuration(event.time),
        ),
    );
    row.appendChild(createElement('span', 'cell cell_type', event.type));
    row.appendChild(createElement('span', 'cell', event.moduleId));
    row.appendChild(createElement('span', 'cell', event.stage || EMPTY));
    row.appendChild(createElement('span', 'cell cell_message', event.message || EMPTY));

    return row;
}

/**
 * Лог событий загрузчика: то, чего не видно в таблице модулей - порядок событий между модулями.
 *
 * Свежие сверху, как и в таблице загрузок: разбираются обычно с тем, что только что произошло.
 */
export function createEventsView(): EventsView {
    const element = createElement('div', 'events');
    const toolbar = createElement('div', 'toolbar');
    const search = createElement('input', 'search');
    const counter = createElement('span', 'toolbar__counter');
    const list = createElement('div', 'events__list');

    search.type = 'search';
    search.placeholder = 'Фильтр по модулю, событию или сообщению';

    // настоящий input внутри label, а не кнопка с классом: так фильтр переключается кликом
    // по подписи и с клавиатуры, а скринридер называет его чекбоксом. Видимый квадратик -
    // соседний span, сам input спрятан визуально, но не от доступности
    const errorsOnly = createElement('label', 'checkbox');
    const errorsOnlyInput = createElement('input', 'checkbox__input');

    errorsOnlyInput.type = 'checkbox';

    errorsOnly.appendChild(errorsOnlyInput);
    errorsOnly.appendChild(createElement('span', 'checkbox__box'));
    errorsOnly.appendChild(createElement('span', 'checkbox__label', 'Только ошибки'));

    toolbar.appendChild(search);
    toolbar.appendChild(errorsOnly);
    toolbar.appendChild(counter);

    element.appendChild(toolbar);
    element.appendChild(list);

    let currentEvents: DevtoolsEvent[] = [];
    let onlyErrors = false;

    function render() {
        const query = search.value.trim().toLowerCase();
        const filtered = currentEvents.filter(
            (event) => (!onlyErrors || event.type === 'error') && matches(event, query),
        );

        counter.textContent =
            filtered.length === currentEvents.length
                ? `событий: ${currentEvents.length}`
                : `показано ${filtered.length} из ${currentEvents.length}`;

        list.textContent = '';

        if (!filtered.length) {
            list.appendChild(
                createElement(
                    'div',
                    'placeholder',
                    currentEvents.length ? 'Ничего не нашлось.' : 'События ещё не записывались.',
                ),
            );

            return;
        }

        const grid = createElement('div', 'grid grid_events');

        grid.appendChild(createHeader());
        filtered
            .slice()
            .reverse()
            .forEach((event) => grid.appendChild(createRow(event)));

        list.appendChild(grid);
    }

    search.addEventListener('input', render);
    errorsOnlyInput.addEventListener('change', () => {
        onlyErrors = errorsOnlyInput.checked;
        render();
    });

    render();

    return {
        element,
        update(events) {
            currentEvents = events;
            render();
        },
    };
}
