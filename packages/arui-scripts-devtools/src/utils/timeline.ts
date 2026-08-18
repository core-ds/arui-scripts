import { type ModuleLoadRecord, type TimelineRow, type TimelineScale } from '../types';

import { getScaleEnd } from './waterfall-scale';

type Bounds = { record: ModuleLoadRecord; from: number; to: number; pending: boolean };

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
    now: number | undefined,
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
    const to = getScaleEnd(Math.max(...ends), pending, now);

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
 * Ось строится на одну загрузку страницы: `performance.now()` у каждой свой, и записи разных
 * загрузок на общей шкале оказались бы где угодно. Делит их по группам вызывающий.
 *
 * @param now «сейчас» по часам страницы; без него незавершённые полоски встают по последней
 * засечке - именно так и надо для записей прошлых загрузок страницы
 */
export function buildTimeline(
    loads: ModuleLoadRecord[],
    now: number | undefined = undefined,
): TimelineScale {
    const bounds = loads
        .map((record) => {
            const measured = getBounds(record, now);

            return measured ? { record, ...measured } : undefined;
        })
        .filter((item): item is Bounds => item !== undefined);

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
