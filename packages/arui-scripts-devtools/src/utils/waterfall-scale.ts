import { type ModuleLoadRecord } from '../types';

import { isFromPreviousPageLoad } from './resource-timing';

/**
 * Правый край шкалы водопада.
 *
 * Пока хоть одна стадия идёт, край - это «сейчас». Иначе им становится начало незавершённой
 * стадии: её полоска получает нулевую ширину у самого края трека, и водопад молчит ровно про то,
 * ради чего его открывают, - на чём модуль висит и как долго.
 *
 * Стадии меряются в `performance.now()`, поэтому к записям предыдущей загрузки страницы «сейчас»
 * не относится: у них своё начало отсчёта, и край им считаем по последней засечке.
 */
export function getScaleEnd(
    record: ModuleLoadRecord,
    lastMark: number,
    hasPending: boolean,
): number {
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
