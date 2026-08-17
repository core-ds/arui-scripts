import { Fragment } from 'react';

import { EMPTY, LOADS_TABLE_COLUMNS, STATUS_LABELS } from '../constants';
import { type LoadsTableProps, type ModuleLoadRecord } from '../types';
import { formatDuration, getTotalDuration } from '../utils/format';
import { isFromPreviousPageLoad } from '../utils/resource-timing';

import { LoadDetails } from './load-details';

function Row({
    record,
    isExpanded,
    onToggle,
}: {
    record: ModuleLoadRecord;
    isExpanded: boolean;
    onToggle(loadId: string): void;
}) {
    return (
        <button
            type='button'
            className={`row row_${record.status}`}
            aria-expanded={isExpanded}
            onClick={() => onToggle(record.loadId)}
        >
            <span className='cell cell_status'>{STATUS_LABELS[record.status]}</span>
            <span className='cell'>
                <span className='marker'>{isExpanded ? '▾' : '▸'}</span>
                <span className='module-id'>{record.moduleId}</span>
                {isFromPreviousPageLoad(record.startedAt) && (
                    <span
                        className='badge'
                        title='Запись восстановлена из sessionStorage от предыдущей загрузки страницы'
                    >
                        прошлая загрузка
                    </span>
                )}
            </span>
            {/* моноширинными - то, что читают по столбцам и сравнивают между строками */}
            <span className='cell cell_mono'>{record.moduleVersion || EMPTY}</span>
            <span className='cell cell_mono'>{record.containerId || EMPTY}</span>
            <span className='cell cell_url'>{record.baseUrl || EMPTY}</span>
            <span className='cell'>{record.fromCache ? 'из кеша' : record.mountMode || EMPTY}</span>
            <span className='cell cell_mono'>{formatDuration(getTotalDuration(record))}</span>
        </button>
    );
}

/**
 * Таблица попыток загрузки, свежие сверху. Строка раскрывается в подробности по клику.
 *
 * Ручной перерисовки по отпечатку, как в vanilla-версии, здесь нет: React переиспользует
 * DOM-узлы по ключу `loadId`, поэтому выделение текста и позиция скролла переживают
 * нотификации стора сами собой.
 */
export function LoadsTable({ loads, expanded, onToggle }: LoadsTableProps) {
    if (!loads.length) {
        return (
            <div className='table'>
                <div className='placeholder'>Модули ещё не загружались на этой странице.</div>
            </div>
        );
    }

    return (
        <div className='table'>
            <div className='grid'>
                <div className='row row_header'>
                    {LOADS_TABLE_COLUMNS.map((title) => (
                        <span className='cell' key={title}>
                            {title}
                        </span>
                    ))}
                </div>
                {/* свежие сверху: разбираться обычно надо с последней загрузкой */}
                {loads
                    .slice()
                    .reverse()
                    .map((record) => {
                        const isExpanded = expanded.has(record.loadId);

                        return (
                            <Fragment key={record.loadId}>
                                <Row record={record} isExpanded={isExpanded} onToggle={onToggle} />
                                {isExpanded && <LoadDetails record={record} />}
                            </Fragment>
                        );
                    })}
            </div>
        </div>
    );
}
