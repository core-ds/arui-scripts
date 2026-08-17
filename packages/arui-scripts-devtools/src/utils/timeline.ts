import { type ModuleLoadRecord, type TimelineRow, type TimelineScale } from '../types';

import { isFromPreviousPageLoad } from './resource-timing';
import { getScaleEnd } from './waterfall-scale';

/** границы одной загрузки по её стадиям: от первой засечки до последней */
function getBounds(record: ModuleLoadRecord): { from: number; to: number; pending: boolean } {
    const timings = Object.values(record.timings ?? {}).filter(Boolean);
    const starts = timings.map((timing) => timing.start);
    const ends = timings.map((timing) => timing.end ?? timing.start);
    const pending = timings.some((timing) => timing.end === undefined);

    return {
        from: Math.min(...starts),
        to: getScaleEnd(record, Math.max(...ends), pending),
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
    const current = loads.filter(
        (record) =>
            !isFromPreviousPageLoad(record.startedAt) &&
            Object.keys(record.timings ?? {}).length > 0,
    );

    if (!current.length) {
        return { from: 0, to: 0, duration: 0, rows: [] };
    }

    const bounds = current.map((record) => ({ record, ...getBounds(record) }));
    const from = Math.min(...bounds.map((item) => item.from));
    const to = Math.max(...bounds.map((item) => item.to));
    // всё уложилось в один тик - шкалу делаем не нулевой, иначе делить не на что
    const duration = to - from || 1;

    const rows: TimelineRow[] = bounds
        // по времени старта, а не по порядку в буфере: ось читают сверху вниз
        .sort((left, right) => left.from - right.from)
        .map(({ record, from: start, to: end, pending }) => ({
            record,
            pending,
            offset: ((start - from) / duration) * 100,
            width: Math.max(((end - start) / duration) * 100, 1),
            duration: end - start,
        }));

    return { from, to, duration, rows };
}
