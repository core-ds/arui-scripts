import { useEffect, useState } from 'react';

import { PENDING_TICK_INTERVAL, STATUS_LABELS } from '../constants';
import { type TimelineViewProps } from '../types';
import { formatDuration } from '../utils/format';
import { buildTimeline } from '../utils/timeline';

/**
 * Все загрузки страницы на одной оси времени.
 *
 * Водопад внутри строки отвечает, что заняло время у конкретного модуля. Здесь другой вопрос,
 * межмодульный: что грузилось параллельно, а что выстроилось в очередь. По логу событий это
 * тоже читается, но числами и в уме.
 *
 * Пока хоть одна загрузка идёт, ось дорастает до «сейчас» сама - стор в это время молчит.
 */
export function TimelineView({ loads }: TimelineViewProps) {
    const timeline = buildTimeline(loads);
    const ticking = timeline.rows.some((row) => row.pending);
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!ticking) {
            return undefined;
        }

        const timer = setInterval(() => setTick((tick) => tick + 1), PENDING_TICK_INTERVAL);

        return () => clearInterval(timer);
    }, [ticking]);

    if (!timeline.rows.length) {
        return (
            <div className='timeline'>
                <div className='placeholder'>
                    Пока нечего показать: на этой странице ещё не было загрузок с замерами.
                </div>
            </div>
        );
    }

    return (
        <div className='timeline'>
            <div className='timeline__scale'>
                <span>0 мс</span>
                <span>{formatDuration(timeline.duration)}</span>
            </div>
            {timeline.rows.map((row) => (
                <div className='timeline__row' key={row.record.loadId}>
                    <span className='timeline__label' title={row.record.moduleId}>
                        {row.record.moduleId}
                    </span>
                    <div className='timeline__track'>
                        <div
                            className={`timeline__bar timeline__bar_${row.record.status}${
                                row.pending ? ' timeline__bar_pending' : ''
                            }`}
                            style={{ marginLeft: `${row.offset}%`, width: `${row.width}%` }}
                            title={`${STATUS_LABELS[row.record.status]} · ${formatDuration(
                                row.duration,
                            )}`}
                        />
                    </div>
                    <span className='timeline__duration'>{formatDuration(row.duration)}</span>
                </div>
            ))}
        </div>
    );
}
