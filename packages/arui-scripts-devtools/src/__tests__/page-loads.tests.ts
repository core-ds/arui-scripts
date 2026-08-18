import { type ModuleLoadRecord } from '../types';
import {
    getPageLoadKey,
    getPageLoadTitle,
    getPageNow,
    groupByPageLoad,
    isFromPreviousPageLoad,
} from '../utils/page-loads';

/** начало отсчёта инспектируемой страницы: панель узнаёт его из снимка, своего у неё нет */
const PAGE_ORIGIN = 1_700_000_000_000;

function createRecord(loadId: string, startedAt: number): ModuleLoadRecord {
    return {
        loadId,
        moduleId: `module-${loadId}`,
        hostAppId: 'host',
        status: 'loaded',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        timings: {},
        startedAt,
    };
}

describe('isFromPreviousPageLoad', () => {
    it('should detect a record restored from the previous page load', () => {
        expect(isFromPreviousPageLoad(PAGE_ORIGIN - 1000, PAGE_ORIGIN)).toBe(true);
    });

    it('should not mark records of the current page load', () => {
        expect(isFromPreviousPageLoad(PAGE_ORIGIN + 1000, PAGE_ORIGIN)).toBe(false);
    });

    it('should not guess while the page clock is unknown', () => {
        // до первого ответа страницы часов нет: своим `performance` панель мерить не может -
        // он отсчитывает время от момента, когда открыли DevTools
        expect(isFromPreviousPageLoad(0, undefined)).toBe(false);
    });
});

describe('getPageNow', () => {
    it('should translate the wall clock into the page timeline', () => {
        jest.spyOn(Date, 'now').mockReturnValue(PAGE_ORIGIN + 1500);

        expect(getPageNow(PAGE_ORIGIN)).toBe(1500);

        jest.restoreAllMocks();
    });

    it('should stay silent without the page clock', () => {
        expect(getPageNow(undefined)).toBeUndefined();
    });
});

describe('getPageLoadKey', () => {
    it('should take the page prefix of the load id', () => {
        expect(getPageLoadKey('a1b2c3-17')).toBe('a1b2c3');
    });

    it('should keep unknown ids in one group', () => {
        // формат loadId - дело стора, и он мог его сменить. Дробить список на группы
        // по одной строке хуже, чем не делить вовсе
        expect(getPageLoadKey('whatever')).toBe('');
        expect(getPageLoadKey('another')).toBe(getPageLoadKey('whatever'));
    });
});

describe('groupByPageLoad', () => {
    it('should return nothing for no records', () => {
        expect(groupByPageLoad([], PAGE_ORIGIN)).toEqual([]);
    });

    it('should keep one page load in one group', () => {
        const groups = groupByPageLoad(
            [createRecord('p1-1', PAGE_ORIGIN + 1), createRecord('p1-2', PAGE_ORIGIN + 2)],
            PAGE_ORIGIN,
        );

        expect(groups).toHaveLength(1);
        expect(groups[0].records).toHaveLength(2);
        expect(groups[0].current).toBe(true);
        expect(groups[0].startedAt).toBe(PAGE_ORIGIN + 1);
    });

    it('should put the current page load first and the older ones after it', () => {
        const groups = groupByPageLoad(
            [
                createRecord('p0-1', PAGE_ORIGIN - 5000),
                createRecord('p1-1', PAGE_ORIGIN - 1000),
                createRecord('p2-1', PAGE_ORIGIN + 1),
            ],
            PAGE_ORIGIN,
        );

        expect(groups.map((group) => group.key)).toEqual(['p2', 'p1', 'p0']);
        expect(groups.map((group) => group.current)).toEqual([true, false, false]);
    });

    it('should treat everything as current while the page clock is unknown', () => {
        // без часов страницы делить записи не по чему: пусть лучше будет один список,
        // чем выдуманная граница
        const groups = groupByPageLoad([createRecord('p0-1', 0)], undefined);

        expect(groups[0].current).toBe(true);
    });

    it('should title a group by its own start time', () => {
        const startedAt = new Date(2026, 0, 1, 14, 32, 5).getTime();
        const [group] = groupByPageLoad([createRecord('p0-1', startedAt)], startedAt + 10_000);

        expect(getPageLoadTitle(group)).toBe('предыдущая загрузка страницы · 14:32:05');
    });
});
