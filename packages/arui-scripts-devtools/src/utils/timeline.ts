import { type ModuleLoadRecord, type TimelineRow, type TimelineScale } from '../types';

import { isFromPreviousPageLoad } from './resource-timing';
import { getScaleEnd } from './waterfall-scale';

/**
 * Границы одной загрузки по её стадиям: от первой засечки до последней.
 *
 * Снимок приходит со страницы - его мог положить загрузчик другой версии или подправить
 * человек в sessionStorage, - поэтому засечки проверяем на число. Одна запись со сломанными
 * таймингами не должна ломать общую шкалу: без этого NaN расползается по ней и полоски
 * здоровых загрузок уезжают на тысячи процентов.
 *
 * @returns границы или undefined, если мерить нечего
 */
function getBounds(
    record: ModuleLoadRecord,
): { from: number; to: number; pending: boolean } | undefined {
    const timings = Object.values(record.timings ?? {}).filter(
        (timing) => timing && Number.isFinite(timing.start),
    );

    if (!timings.length) {
        return undefined;
    }

    const starts = timings.map((timing) => timing.start);
    const ends = timings.map((timing) =>
        Number.isFinite(timing.end) ? (timing.end as number) : timing.start,
    );
    const pending = timings.some((timing) => !Number.isFinite(timing.end));
    const to = getScaleEnd(record, Math.max(...ends), pending);

    return {
        from: Math.min(...starts),
        to: Number.isFinite(to) ? to : Math.max(...ends),
        pending,
    };
}

/**
 * Раскладывает загрузки на одну ось времени.
 *
 * Водопад отвечает на вопрос «что заняло время внутри этого модуля», а таймлайн - на другой,
 * межмодульный: что грузилось параллельно, а что выстроилось в очередь. Из лога событий это
 * тоже видно, но глазами по числам.
 *
 * Записи предыдущей загрузки страницы сюда не попадают: у них своё начало отсчёта, и на одной
 * шкале с текущими они оказались бы где угодно.
 */
export function buildTimeline(loads: ModuleLoadRecord[]): TimelineScale {
    const bounds = loads
        .filter((record) => !isFromPreviousPageLoad(record.startedAt))
        .map((record) => {
            const measured = getBounds(record);

            return measured ? { record, ...measured } : undefined;
        })
        .filter(
            (
                item,
            ): item is { record: ModuleLoadRecord; from: number; to: number; pending: boolean } =>
                item !== undefined,
        );

    if (!bounds.length) {
        return { from: 0, to: 0, duration: 0, rows: [] };
    }

    const from = Math.min(...bounds.map((item) => item.from));
    const to = Math.max(...bounds.map((item) => item.to));
    // всё уложилось в один тик - шкалу делаем не нулевой, иначе делить не на что
    const duration = to - from || 1;

    const rows: TimelineRow[] = bounds
        // по времени старта, а не по порядку в буфере: ось читают сверху вниз
        .sort((left, right) => left.from - right.from)
        .map(({ record, from: start, to: end, pending }) => {
            const offset = Math.min(Math.max(((start - from) / duration) * 100, 0), 100);
            // полоска не имеет права вылезти за трек, даже если засечки записи противоречивы
            const width = Math.min(Math.max(((end - start) / duration) * 100, 1), 100 - offset);

            return { record, pending, offset, width, duration: Math.max(end - start, 0) };
        });

    return { from, to, duration, rows };
}
