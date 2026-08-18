import { Fragment } from 'react';

import { EMPTY, EVENTS_COLUMNS } from '../constants';
import { type EventsViewProps } from '../types';
import { matchesEvent } from '../utils/event-matches';
import { formatClock, formatDuration } from '../utils/format';
import { getPageLoadKey, groupByPageLoad, isFromPreviousPageLoad } from '../utils/page-loads';

import { usePageTimeOrigin } from './page-clock';
import { PageLoadSeparator } from './page-load-separator';

/**
 * Лог событий загрузчика: то, чего не видно в таблице модулей - порядок событий между модулями.
 *
 * Свежие сверху, как и в таблице загрузок: разбираются обычно с тем, что только что произошло.
 */
export function EventsView({
    events,
    loads,
    query,
    onQueryChange,
    onlyErrors,
    onOnlyErrorsChange,
}: EventsViewProps) {
    const pageTimeOrigin = usePageTimeOrigin();
    const normalized = query.trim().toLowerCase();
    const filtered = events.filter(
        (event) => (!onlyErrors || event.type === 'error') && matchesEvent(event, normalized),
    );
    // группы берём из записей о загрузках: у события есть loadId, но нет собственного
    // признака «из какой это загрузки страницы»
    const pageLoads = new Map(
        groupByPageLoad(loads, pageTimeOrigin).map((group) => [group.key, group]),
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
                    {EVENTS_COLUMNS.map((title) => (
                        <span className='cell' key={title}>
                            {title}
                        </span>
                    ))}
                </div>
                {filtered
                    .slice()
                    .reverse()
                    .map((event, index, rows) => {
                        const key = getPageLoadKey(event.loadId);
                        const group = pageLoads.get(key);
                        const startsGroup =
                            pageLoads.size > 1 &&
                            (index === 0 || getPageLoadKey(rows[index - 1].loadId) !== key);
                        const previous = isFromPreviousPageLoad(event.timestamp, pageTimeOrigin);

                        return (
                            <Fragment key={event.id}>
                                {startsGroup && group && <PageLoadSeparator group={group} />}
                                <div
                                    className={`row row_event${
                                        event.type === 'error' ? ' row_error' : ''
                                    }`}
                                >
                                    <span
                                        className='cell cell_mono'
                                        title={
                                            previous
                                                ? 'Время по часам: у прошлой загрузки страницы своё начало отсчёта'
                                                : undefined
                                        }
                                    >
                                        {/* от начала загрузки страницы - но только своей:
                                            у записей прошлой загрузки другой отсчёт */}
                                        {previous
                                            ? formatClock(event.timestamp)
                                            : formatDuration(event.time)}
                                    </span>
                                    <span className='cell cell_type'>{event.type}</span>
                                    <span className='cell'>{event.moduleId}</span>
                                    <span className='cell'>{event.stage || EMPTY}</span>
                                    <span className='cell cell_message'>
                                        {event.message || EMPTY}
                                    </span>
                                </div>
                            </Fragment>
                        );
                    })}
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
