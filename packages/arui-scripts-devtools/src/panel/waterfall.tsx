import { useEffect, useState } from 'react';

import { MIN_BAR_WIDTH, PENDING_TICK_INTERVAL, STAGE_HINTS, STAGE_ORDER } from '../constants';
import { type WaterfallProps } from '../types';
import { formatDuration } from '../utils/format';
import { isFromPreviousPageLoad } from '../utils/resource-timing';
import { getScaleEnd } from '../utils/waterfall-scale';

import { Hint } from './hint';

/**
 * Водопад стадий одной загрузки: видно и длительность каждой стадии, и паузы между ними.
 *
 * Незавершённые стадии рисуем до текущего конца шкалы - так видно, на чём модуль висит.
 * Пока такая стадия на экране, водопад дорисовывает себя сам: стор в это время молчит,
 * и без собственного таймера картинка замирала бы на моменте последнего события.
 */
export function Waterfall({ record }: WaterfallProps) {
    const stages = STAGE_ORDER.filter((stage) => record.timings[stage]).map((stage) => ({
        stage,
        timing: record.timings[stage]!,
    }));

    const hasPending = stages.some((item) => item.timing.end === undefined);
    const ticking = hasPending && !isFromPreviousPageLoad(record.startedAt);
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!ticking) {
            return undefined;
        }

        const timer = setInterval(() => setTick((tick) => tick + 1), PENDING_TICK_INTERVAL);

        return () => clearInterval(timer);
    }, [ticking]);

    if (!stages.length) {
        return (
            <div className='waterfall'>
                <div className='waterfall__title'>Стадии</div>
                <div className='resources__empty'>нет замеров</div>
            </div>
        );
    }

    const starts = stages.map((item) => item.timing.start);
    const ends = stages.map((item) => item.timing.end ?? item.timing.start);
    const from = Math.min(...starts);
    const lastMark = Math.max(...ends);
    const to = getScaleEnd(record, lastMark, hasPending);
    // всё уложилось в один тик - шкалу делаем не нулевой, иначе делить не на что
    const total = to - from || 1;

    return (
        <div className='waterfall'>
            <div className='waterfall__title'>Стадии</div>
            {stages.map(({ stage, timing }) => {
                const isPending = timing.end === undefined;
                const end = timing.end ?? to;
                const width = Math.max(((end - timing.start) / total) * 100, MIN_BAR_WIDTH);
                // полоску, которую расширили до минимума, двигаем внутрь трека: вылезшая
                // за правый край всё равно не видна, а рисовать невидимое незачем
                const marginLeft = Math.min(((timing.start - from) / total) * 100, 100 - width);

                return (
                    <div className='waterfall__row' key={stage}>
                        <span className='waterfall__stage'>
                            <span className='waterfall__stage-name'>{stage}</span>
                            <Hint text={STAGE_HINTS[stage]} label={`Что значит стадия ${stage}`} />
                        </span>
                        <div className='waterfall__track'>
                            <div
                                className={`waterfall__bar${
                                    isPending ? ' waterfall__bar_pending' : ''
                                }`}
                                style={{ marginLeft: `${marginLeft}%`, width: `${width}%` }}
                            />
                        </div>
                        <span className='waterfall__duration'>
                            {isPending
                                ? `не завершилась, ${formatDuration(end - timing.start)}`
                                : formatDuration(end - timing.start)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
