import { createContext, useContext } from 'react';

/**
 * Начало отсчёта времени инспектируемой страницы, `performance.timeOrigin`.
 *
 * Контекст, а не пропс: время нужно листьям дерева - строке таблицы, водопаду, - а по дороге
 * туда о нём знать некому. Значение приходит из снимка: у документа панели свой `performance`,
 * и его отсчёт начинается в момент открытия вкладки DevTools, к странице отношения не имея.
 *
 * `undefined` - страница ещё не ответила. Тогда панель про время молчит, а не выдумывает.
 */
export const PageClockContext = createContext<number | undefined>(undefined);

export function usePageTimeOrigin(): number | undefined {
    return useContext(PageClockContext);
}
