import { EMPTY, EVENT_BUS_COLUMNS } from '../constants';
import { type EventBusEventRecord, type EventBusViewProps } from '../types';
import { formatDuration } from '../utils/format';

function formatPayload(record: EventBusEventRecord): string {
    if (record.payload === undefined) {
        return EMPTY;
    }

    if (typeof record.payload === 'string') {
        return record.payload;
    }

    try {
        return JSON.stringify(record.payload);
    } catch {
        return '[несериализуемо]';
    }
}

function matches(record: EventBusEventRecord, query: string): boolean {
    if (!query) {
        return true;
    }

    return [record.bus, record.eventName, formatPayload(record)].some((value) =>
        value.toLowerCase().includes(query),
    );
}

/**
 * Вкладка событийной шины: что было отправлено и сколько слушателей это получили.
 *
 * Второй неймспейс того же контракта - его наполняет `@alfalab/client-event-bus`, пакет,
 * который про загрузчик модулей ничего не знает. Ради одного вопроса, на который иначе
 * отвечают консольными логами: событие ушло, а почему никто не отреагировал.
 */
export function EventBusView({ state, query, onQueryChange }: EventBusViewProps) {
    if (state.status === 'unsupported') {
        return (
            <div className='events'>
                <div className='status status_error'>
                    {`Контракт шины версии ${state.found}, расширение умеет читать ${state.supported}. Обновите то, что старше.`}
                </div>
            </div>
        );
    }

    if (state.status === 'waiting') {
        return (
            <div className='events'>
                <div className='placeholder'>
                    Ждём событийную шину: на странице ещё не было ни отправок, ни подписок.
                </div>
            </div>
        );
    }

    const { events, listeners } = state.snapshot;
    const normalized = query.trim().toLowerCase();
    const filtered = events.filter((record) => matches(record, normalized));
    const silent = listeners.filter(
        (listener) => !events.some((record) => record.eventName === listener.eventName),
    );

    return (
        <div className='events'>
            <div className='toolbar'>
                <input
                    className='search'
                    type='search'
                    placeholder='Фильтр по шине, событию или нагрузке'
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                />
                <span className='toolbar__counter'>
                    {filtered.length === events.length
                        ? `событий: ${events.length}`
                        : `показано ${filtered.length} из ${events.length}`}
                </span>
            </div>
            <div className='events__list'>
                {silent.length > 0 && (
                    <div className='bus-listeners'>
                        {`Подписки без единого события: ${silent
                            .map((listener) => `${listener.eventName} (${listener.count})`)
                            .join(', ')}`}
                    </div>
                )}
                {filtered.length ? (
                    <div className='grid grid_bus'>
                        <div className='row row_bus row_header'>
                            {EVENT_BUS_COLUMNS.map((title) => (
                                <span className='cell' key={title}>
                                    {title}
                                </span>
                            ))}
                        </div>
                        {filtered
                            .slice()
                            .reverse()
                            .map((record) => (
                                <div
                                    className={`row row_bus${
                                        record.listeners === 0 ? ' row_bus_unheard' : ''
                                    }`}
                                    key={record.id}
                                >
                                    <span className='cell cell_mono'>
                                        {formatDuration(record.time)}
                                    </span>
                                    <span className='cell cell_mono'>{record.bus}</span>
                                    <span className='cell'>{record.eventName}</span>
                                    <span
                                        className='cell cell_mono'
                                        title={
                                            record.listeners === 0
                                                ? 'Событие ушло, но подписчиков не было'
                                                : undefined
                                        }
                                    >
                                        {record.listeners}
                                    </span>
                                    <span
                                        className='cell cell_message'
                                        title={
                                            record.payloadOmitted
                                                ? 'Нагрузка не сериализуема, показано описание'
                                                : undefined
                                        }
                                    >
                                        {formatPayload(record)}
                                    </span>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className='placeholder'>
                        {events.length ? 'Ничего не нашлось.' : 'События ещё не отправлялись.'}
                    </div>
                )}
            </div>
        </div>
    );
}
