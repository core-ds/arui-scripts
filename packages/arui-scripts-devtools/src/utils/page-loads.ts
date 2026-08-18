import { PAGE_LOAD_LABELS } from '../constants';
import { type ModuleLoadRecord, type PageLoadGroup } from '../types';

import { formatClock } from './format';

/**
 * Запись относится к предыдущей загрузке страницы: её восстановили из sessionStorage.
 *
 * Отдельного поля в контракте для этого нет и не нужно - хватает сравнения с началом отсчёта.
 * Начало отсчёта обязательно приходит со страницы: у документа панели свой `performance`,
 * и его `timeOrigin` - это момент открытия вкладки DevTools, к странице не относящийся никак.
 * Не знаем часов страницы - значит не знаем и ответа, и делить записи не берёмся.
 */
export function isFromPreviousPageLoad(
    startedAt: number,
    pageTimeOrigin: number | undefined,
): boolean {
    return pageTimeOrigin === undefined ? false : startedAt < pageTimeOrigin;
}

/**
 * «Сейчас» на часах страницы.
 *
 * Стадии меряются в `performance.now()` страницы, а панель живёт в другом документе со своим
 * началом отсчёта. Общий у них `Date.now()` - через него и переводим.
 */
export function getPageNow(pageTimeOrigin: number | undefined): number | undefined {
    return pageTimeOrigin === undefined ? undefined : Date.now() - pageTimeOrigin;
}

/**
 * Ключ загрузки страницы, общий у всех её записей.
 *
 * `loadId` выглядит как `${случайный префикс страницы}-${номер}`: префикс стор выбирает один раз
 * на страницу, чтобы восстановленные из sessionStorage записи не столкнулись с новыми. Заодно
 * он отвечает на вопрос «из какой это загрузки страницы» - без единого нового поля в контракте.
 *
 * Формат `loadId` - дело стора, и он мог его сменить. Незнакомый id получает общий пустой ключ:
 * такие записи остаются одной группой. Разложить их по загрузкам страницы всё равно не по чему,
 * а дробить список на группы по одной строке - худшее из возможных.
 */
export function getPageLoadKey(loadId: string): string {
    const separator = loadId.indexOf('-');

    return separator === -1 ? '' : loadId.slice(0, separator);
}

/**
 * Раскладывает записи по загрузкам страницы: текущая первой, прошлые - от свежих к старым.
 *
 * Смешивать их в одном списке нельзя нигде, где есть время: `performance.now()` у каждой
 * загрузки страницы свой, и на общей оси записи прошлой оказались бы где угодно.
 */
export function groupByPageLoad(
    loads: ModuleLoadRecord[],
    pageTimeOrigin: number | undefined,
): PageLoadGroup[] {
    const groups = new Map<string, PageLoadGroup>();

    loads.forEach((record) => {
        const key = getPageLoadKey(record.loadId);
        const existing = groups.get(key);

        if (existing) {
            existing.records.push(record);
            existing.startedAt = Math.min(existing.startedAt, record.startedAt);
            existing.current =
                existing.current && !isFromPreviousPageLoad(record.startedAt, pageTimeOrigin);

            return;
        }

        groups.set(key, {
            key,
            records: [record],
            startedAt: record.startedAt,
            current: !isFromPreviousPageLoad(record.startedAt, pageTimeOrigin),
        });
    });

    // текущая загрузка сверху, дальше - от свежей к старой: чем ближе к началу списка,
    // тем ближе к «сейчас», в какую бы сторону ни читали
    return Array.from(groups.values()).sort((left, right) => {
        if (left.current !== right.current) {
            return left.current ? -1 : 1;
        }

        return right.startedAt - left.startedAt;
    });
}

/**
 * Подпись загрузки страницы: чья это группа и когда началась.
 *
 * Время по часам, а не «столько-то назад»: страницу перезагружают несколько раз подряд,
 * и «2 минуты назад» у соседних групп сливается в одно и то же.
 */
export function getPageLoadTitle(group: PageLoadGroup): string {
    const label = group.current ? PAGE_LOAD_LABELS.current : PAGE_LOAD_LABELS.previous;

    return `${label} · ${formatClock(group.startedAt)}`;
}
