import { useEffect, useState } from 'react';

import { PENDING_TICK_INTERVAL, STATUS_LABELS } from '../constants';
import { type TimelineScaleProps, type TimelineViewProps } from '../types';
import { formatDuration } from '../utils/format';
import { getPageLoadTitle, getPageNow, groupByPageLoad } from '../utils/page-loads';
import { buildTimeline } from '../utils/timeline';

import { usePageTimeOrigin } from './page-clock';

/** одна ось: загрузки, разложенные по времени в процентах от общей длительности */
function TimelineScaleView({ scale }: TimelineScaleProps) {
    return (
        <div className='timeline__scale-block'>
            <div className='timeline__scale'>
                <span>0 мс</span>
                <span>{formatDuration(scale.duration)}</span>
            </div>
            {scale.rows.map((row) => (
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

/**
 * Все загрузки страницы на одной оси времени.
 *
 * Водопад внутри строки отвечает, что заняло время у конкретного модуля. Здесь другой вопрос,
 * межмодульный: что грузилось параллельно, а что выстроилось в очередь. По логу событий это
 * тоже читается, но числами и в уме.
 *
 * Ось у каждой загрузки страницы своя. Общей быть не может: `performance.now()` отсчитывается
 * от начала своей страницы, а пауза между перезагрузками - это время, которое человек потратил
 * на раздумья, и растягивать на неё шкалу незачем.
 *
 * Пока хоть одна загрузка идёт, ось дорастает до «сейчас» сама - стор в это время молчит.
 */
export function TimelineView({ loads }: TimelineViewProps) {
    const pageTimeOrigin = usePageTimeOrigin();
    const groups = groupByPageLoad(loads, pageTimeOrigin);
    const scales = groups
        .map((group) => ({
            group,
            // «сейчас» есть только у текущей страницы: у прошлых загрузок свой отсчёт
            scale: buildTimeline(
                group.records,
                group.current ? getPageNow(pageTimeOrigin) : undefined,
            ),
        }))
        .filter((item) => item.scale.rows.length > 0);

    const ticking = scales.some((item) => item.scale.rows.some((row) => row.pending));
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!ticking) {
            return undefined;
        }

        const timer = setInterval(() => setTick((tick) => tick + 1), PENDING_TICK_INTERVAL);

        return () => clearInterval(timer);
    }, [ticking]);

    if (!scales.length) {
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
            {scales.map(({ group, scale }) => (
                <section className='timeline__page-load' key={group.key}>
                    {/* одна группа - подписывать нечего: это и есть текущая страница */}
                    {scales.length > 1 && (
                        <h2 className='page-load page-load_header'>
                            <span className='page-load__icon' aria-hidden='true'>
                                ⟳
                            </span>
                            {getPageLoadTitle(group)}
                        </h2>
                    )}
                    <TimelineScaleView scale={scale} />
                </section>
            ))}
        </div>
    );
}
