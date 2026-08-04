import { type DevtoolsEvent } from '../contract';
import { isFromPreviousPageLoad } from '../resource-timing';

import { EMPTY, formatDuration } from './format';

const COLUMNS = ['Время', 'Событие', 'Модуль', 'Стадия', 'Сообщение'];

function matches(event: DevtoolsEvent, query: string) {
    if (!query) {
        return true;
    }

    return [event.moduleId, event.type, event.stage, event.message]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
}

export type EventsViewProps = {
    events: DevtoolsEvent[];
    /** фильтры контролирует панель: значения должны переживать переключение вкладок */
    query: string;
    onQueryChange(query: string): void;
    onlyErrors: boolean;
    onOnlyErrorsChange(onlyErrors: boolean): void;
};

/**
 * Лог событий загрузчика: то, чего не видно в таблице модулей - порядок событий между модулями.
 *
 * Свежие сверху, как и в таблице загрузок: разбираются обычно с тем, что только что произошло.
 */
export function EventsView({
    events,
    query,
    onQueryChange,
    onlyErrors,
    onOnlyErrorsChange,
}: EventsViewProps) {
    const normalized = query.trim().toLowerCase();
    const filtered = events.filter(
        (event) => (!onlyErrors || event.type === 'error') && matches(event, normalized),
    );

    let list = (
        <div className='placeholder'>
            {events.length ? 'Ничего не нашлось.' : 'События ещё не записывались.'}
        </div>
    );

    if (filtered.length) {
        list = (
            <div className='grid grid_events'>
                <div className='row row_event row_header'>
                    {COLUMNS.map((title) => (
                        <span className='cell' key={title}>
                            {title}
                        </span>
                    ))}
                </div>
                {filtered
                    .slice()
                    .reverse()
                    .map((event) => (
                        <div
                            className={`row row_event${event.type === 'error' ? ' row_error' : ''}`}
                            key={event.id}
                        >
                            <span className='cell cell_mono'>
                                {/* время от начала загрузки страницы; у записей прошлой
                                    загрузки своё начало отсчёта */}
                                {isFromPreviousPageLoad(event.timestamp)
                                    ? EMPTY
                                    : formatDuration(event.time)}
                            </span>
                            <span className='cell cell_type'>{event.type}</span>
                            <span className='cell'>{event.moduleId}</span>
                            <span className='cell'>{event.stage || EMPTY}</span>
                            <span className='cell cell_message'>{event.message || EMPTY}</span>
                        </div>
                    ))}
            </div>
        );
    }

    return (
        <div className='events'>
            <div className='toolbar'>
                <input
                    className='search'
                    type='search'
                    placeholder='Фильтр по модулю, событию или сообщению'
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                />
                {/* настоящий input внутри label, а не кнопка с классом: так фильтр переключается
                    кликом по подписи и с клавиатуры, а скринридер называет его чекбоксом */}
                <label className='checkbox'>
                    <input
                        className='checkbox__input'
                        type='checkbox'
                        checked={onlyErrors}
                        onChange={(event) => onOnlyErrorsChange(event.target.checked)}
                    />
                    <span className='checkbox__box' />
                    <span className='checkbox__label'>Только ошибки</span>
                </label>
                <span className='toolbar__counter'>
                    {filtered.length === events.length
                        ? `событий: ${events.length}`
                        : `показано ${filtered.length} из ${events.length}`}
                </span>
            </div>
            <div className='events__list'>{list}</div>
        </div>
    );
}
