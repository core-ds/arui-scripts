import { EMPTY } from '../constants';
import { type ModuleLoadRecord } from '../types';

export function formatDuration(ms: number | undefined): string {
    if (ms === undefined || !Number.isFinite(ms)) {
        return EMPTY;
    }

    if (ms < 1000) {
        return `${Math.round(ms)} мс`;
    }

    return `${(ms / 1000).toFixed(2)} с`;
}

export function formatBytes(bytes: number | undefined): string | undefined {
    if (bytes === undefined || !Number.isFinite(bytes)) {
        return undefined;
    }

    if (bytes < 1024) {
        return `${bytes} Б`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} КБ`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

/**
 * Время по часам, ЧЧ:ММ:СС.
 *
 * Так показываем моменты, которые не с чем соотнести на шкале текущей страницы: у записей
 * прошлых загрузок своё начало отсчёта, и «120 мс» у них означало бы совсем другой момент.
 */
export function formatClock(timestamp: number | undefined): string {
    if (timestamp === undefined || !Number.isFinite(timestamp)) {
        return EMPTY;
    }

    const date = new Date(timestamp);

    return [date.getHours(), date.getMinutes(), date.getSeconds()]
        .map((part) => String(part).padStart(2, '0'))
        .join(':');
}

/**
 * Полное время загрузки модуля.
 *
 * Считаем по стадиям, а не по `finishedAt - startedAt`: между стадиями модуль может ждать
 * приложение, и такое ожидание в «время загрузки» записывать нечестно. Пока модуль грузится,
 * времени ещё нет.
 */
export function getTotalDuration(record: ModuleLoadRecord): number | undefined {
    // запись могла приехать из sessionStorage от прошлой загрузки страницы - там что угодно
    const timings = Object.values(record.timings ?? {}).filter(Boolean);

    if (!timings.length) {
        return undefined;
    }

    // Хотя бы одна стадия ещё идёт - значит модуль не догрузился, и «полного времени» у него
    // нет. Считать его по завершённым стадиям нельзя: у висящего модуля получилось бы бодрое
    // «250 мс», хотя он стоит уже полминуты, - ровно там, где панель и нужна.
    if (timings.some((timing) => timing.end === undefined)) {
        return undefined;
    }

    const starts = timings.map((timing) => timing.start);
    const ends = timings.map((timing) => timing.end as number);

    return Math.max(...ends) - Math.min(...starts);
}
