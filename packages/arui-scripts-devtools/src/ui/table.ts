import { type ModuleLoadRecord } from '../contract';
import { isFromPreviousPageLoad } from '../resource-timing';

import { createElement } from './dom';
import { EMPTY, formatDuration, getTotalDuration } from './format';
import { createLoadDetails } from './load-details';

const STATUS_LABELS: Record<ModuleLoadRecord['status'], string> = {
    pending: 'грузится',
    loaded: 'загружен',
    error: 'ошибка',
    unmounted: 'размонтирован',
};

const COLUMNS = ['Статус', 'Модуль', 'Версия', 'Container', 'baseUrl', 'Режим', 'Время'];

export type LoadsTable = {
    element: HTMLElement;
    update(loads: ModuleLoadRecord[]): void;
};

function createHeader() {
    const header = createElement('div', 'row row_header');

    COLUMNS.forEach((title) => header.appendChild(createElement('span', 'cell', title)));

    return header;
}

function createRow(record: ModuleLoadRecord, isExpanded: boolean) {
    const row = createElement('button', `row row_${record.status}`);

    row.type = 'button';
    row.setAttribute('aria-expanded', String(isExpanded));

    const status = createElement('span', 'cell cell_status', STATUS_LABELS[record.status]);
    const moduleCell = createElement('span', 'cell');

    moduleCell.appendChild(createElement('span', 'marker', isExpanded ? '▾' : '▸'));
    moduleCell.appendChild(createElement('span', 'module-id', record.moduleId));

    if (isFromPreviousPageLoad(record.startedAt)) {
        const previous = createElement('span', 'badge', 'прошлая загрузка');

        previous.title = 'Запись восстановлена из sessionStorage от предыдущей загрузки страницы';
        moduleCell.appendChild(previous);
    }

    row.appendChild(status);
    row.appendChild(moduleCell);
    // моноширинными - то, что читают по столбцам и сравнивают между строками
    row.appendChild(createElement('span', 'cell cell_mono', record.moduleVersion || EMPTY));
    row.appendChild(createElement('span', 'cell cell_mono', record.containerId || EMPTY));
    row.appendChild(createElement('span', 'cell cell_url', record.baseUrl || EMPTY));
    row.appendChild(
        createElement('span', 'cell', record.fromCache ? 'из кеша' : record.mountMode || EMPTY),
    );
    row.appendChild(
        createElement('span', 'cell cell_mono', formatDuration(getTotalDuration(record))),
    );

    return row;
}

/**
 * Отпечаток того, что таблица показывает прямо сейчас.
 *
 * У свёрнутой строки видно только её ячейки, у раскрытой - ещё и подробности, поэтому в отпечаток
 * идёт вся запись целиком. Записи заведомо сериализуемы: стор кладёт их в sessionStorage.
 */
function getSignature(loads: ModuleLoadRecord[], expanded: Set<string>): string | undefined {
    try {
        return JSON.stringify(
            loads.map((record) =>
                expanded.has(record.loadId)
                    ? record
                    : [
                          record.loadId,
                          record.status,
                          record.moduleId,
                          record.moduleVersion,
                          record.containerId,
                          record.baseUrl,
                          record.mountMode,
                          record.fromCache,
                          record.startedAt,
                          getTotalDuration(record),
                      ],
            ),
        );
    } catch {
        // не смогли посчитать - значит сравнивать не с чем, перерисовываем
        return undefined;
    }
}

/**
 * Таблица попыток загрузки, свежие сверху. Строка раскрывается в подробности по клику.
 *
 * Данных мало (кольцевой буфер стора), поэтому таблица перерисовывается целиком - это проще
 * и предсказуемее, чем сверять DOM с новым снимком. Но только когда в ней действительно что-то
 * поменялось: на одну загрузку модуля приходится больше тридцати нотификаций стора, и почти все
 * не меняют ни одной ячейки. Перерисовка на каждую из них снимает выделение текста и отматывает
 * контейнер наверх - именно тогда, когда пользователь пытается прочитать стек ошибки.
 *
 * Раскрытые строки запоминаются по loadId и переживают перерисовку.
 */
export function createLoadsTable(): LoadsTable {
    const expanded = new Set<string>();
    const element = createElement('div', 'table');

    let currentLoads: ModuleLoadRecord[] = [];
    let renderedSignature: string | undefined;
    let rendered = false;

    function createContent() {
        if (!currentLoads.length) {
            return createElement(
                'div',
                'placeholder',
                'Модули ещё не загружались на этой странице.',
            );
        }

        const grid = createElement('div', 'grid');

        grid.appendChild(createHeader());

        // свежие сверху: разбираться обычно надо с последней загрузкой
        currentLoads
            .slice()
            .reverse()
            .forEach((record) => {
                const isExpanded = expanded.has(record.loadId);
                const row = createRow(record, isExpanded);

                row.addEventListener('click', () => {
                    if (expanded.has(record.loadId)) {
                        expanded.delete(record.loadId);
                    } else {
                        expanded.add(record.loadId);
                    }

                    render();
                });

                grid.appendChild(row);

                if (isExpanded) {
                    grid.appendChild(createLoadDetails(record));
                }
            });

        return grid;
    }

    function render() {
        const signature = getSignature(currentLoads, expanded);

        if (rendered && signature !== undefined && signature === renderedSignature) {
            return;
        }

        renderedSignature = signature;
        rendered = true;

        // новое содержимое собираем до того, как убрать старое: так контейнер не остаётся
        // пустым ни на мгновение
        const content = createContent();

        element.textContent = '';
        element.appendChild(content);
    }

    render();

    return {
        element,
        update(loads) {
            currentLoads = loads;

            // записи, вытесненные из кольцевого буфера, не должны копиться в множестве раскрытых
            const alive = new Set(loads.map((record) => record.loadId));

            expanded.forEach((loadId) => {
                if (!alive.has(loadId)) {
                    expanded.delete(loadId);
                }
            });

            render();
        },
    };
}
