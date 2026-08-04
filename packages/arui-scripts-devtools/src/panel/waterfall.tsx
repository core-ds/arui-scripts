import { useEffect, useState } from 'react';

import { type DevtoolsStage, type ModuleLoadRecord } from '../contract';
import { isFromPreviousPageLoad } from '../resource-timing';

import { formatDuration } from './format';
import { Hint } from './hint';

/** порядок стадий в водопаде - тот же, в котором их проходит загрузчик */
const STAGE_ORDER: DevtoolsStage[] = [
    'fetch-manifest',
    'fetch-resources',
    'init-sharing',
    'container-init',
    'container-get',
    'factory',
    // заменяет собой четыре стадии module federation у compat-модулей
    'compat-get',
    'mount',
];

/**
 * Что происходит на каждой стадии.
 *
 * Названия - внутренняя терминология загрузчика, по ним не догадаешься, а половина стадий
 * приходит из module federation. Показываем подсказкой на названии: она не занимает места
 * в и без того плотном водопаде и не может быть обрезана краем панели, в отличие от всплывашки
 * своей вёрстки.
 */
const STAGE_HINTS: Record<DevtoolsStage, string> = {
    'fetch-manifest':
        'Загрузка манифеста провайдера (webpack-assets.json): из него берутся адреса скриптов и стилей модуля.',
    'fetch-resources':
        'Скрипты и стили модуля вставляются в документ, загрузчик ждёт, пока браузер их загрузит.',
    'init-sharing':
        '__webpack_init_sharing__: приложение-хост кладёт свои общие библиотеки в share scope, чтобы модуль мог взять их оттуда.',
    'container-init':
        'container.init(): контейнер провайдера получает share scope и добавляет туда свои версии библиотек.',
    'container-get': 'container.get(): у контейнера запрашивается фабрика нужного модуля.',
    factory: 'Вызов фабрики: код модуля исполняется и отдаёт свои экспорты.',
    'compat-get':
        'Compat-модуль берётся из window: его скрипт при загрузке сам положил туда свой глобал.',
    mount: 'Вызов mount() у модуля: модуль рисует себя в переданный элемент.',
};

/** минимальная ширина полоски, %: стадия, уложившаяся в один тик, тоже должна быть видна */
const MIN_BAR_WIDTH = 1;

/** как часто дорисовывается водопад, пока в нём висит незавершённая стадия, мс */
export const PENDING_TICK_INTERVAL = 500;

/**
 * Правый край шкалы.
 *
 * Пока хоть одна стадия идёт, край - это «сейчас». Иначе им становится начало незавершённой
 * стадии: её полоска получает нулевую ширину у самого края трека, и водопад молчит ровно про то,
 * ради чего его открывают, - на чём модуль висит и как долго.
 *
 * Стадии меряются в `performance.now()`, поэтому к записям предыдущей загрузки страницы «сейчас»
 * не относится: у них своё начало отсчёта, и край им считаем по последней засечке.
 */
function getScaleEnd(record: ModuleLoadRecord, lastMark: number, hasPending: boolean): number {
    if (!hasPending || isFromPreviousPageLoad(record.startedAt)) {
        return lastMark;
    }

    try {
        if (typeof performance === 'undefined' || typeof performance.now !== 'function') {
            return lastMark;
        }

        return Math.max(lastMark, performance.now());
    } catch {
        return lastMark;
    }
}

export type WaterfallProps = {
    record: ModuleLoadRecord;
};

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
