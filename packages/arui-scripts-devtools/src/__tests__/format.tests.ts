import { EMPTY } from '../constants';
import { type ModuleLoadRecord } from '../contract';
import { formatBytes, formatDuration, getTotalDuration } from '../utils/format';

function createRecord(timings: ModuleLoadRecord['timings']): ModuleLoadRecord {
    return {
        loadId: 'load-1',
        moduleId: 'module',
        hostAppId: 'host',
        status: 'pending',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        startedAt: 0,
        timings,
    };
}

describe('formatDuration', () => {
    it('показывает миллисекунды до секунды', () => {
        expect(formatDuration(0)).toBe('0 мс');
        expect(formatDuration(999)).toBe('999 мс');
    });

    it('переходит на секунды', () => {
        expect(formatDuration(1000)).toBe('1.00 с');
        expect(formatDuration(1543)).toBe('1.54 с');
    });

    it('ставит прочерк вместо отсутствующего и нечислового', () => {
        expect(formatDuration(undefined)).toBe(EMPTY);
        expect(formatDuration(NaN)).toBe(EMPTY);
        expect(formatDuration(Infinity)).toBe(EMPTY);
    });
});

describe('formatBytes', () => {
    it('переключает единицы', () => {
        expect(formatBytes(512)).toBe('512 Б');
        expect(formatBytes(2048)).toBe('2.0 КБ');
        expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 МБ');
    });

    it('ничего не возвращает для отсутствующего и нечислового', () => {
        expect(formatBytes(undefined)).toBeUndefined();
        expect(formatBytes(NaN)).toBeUndefined();
    });
});

describe('getTotalDuration', () => {
    it('считает от первой начатой стадии до последней завершённой', () => {
        const record = createRecord({
            'fetch-manifest': { start: 100, end: 350 },
            'fetch-resources': { start: 360, end: 800 },
        });

        expect(getTotalDuration(record)).toBe(700);
    });

    it('не считает время, пока хоть одна стадия не завершилась', () => {
        // висящий модуль: манифест приехал, ресурсы стоят уже полминуты.
        // Показать тут «250 мс» - соврать ровно там, где панель и нужна
        const record = createRecord({
            'fetch-manifest': { start: 100, end: 350 },
            'fetch-resources': { start: 360 },
        });

        expect(getTotalDuration(record)).toBeUndefined();
    });

    it('не считает время, когда не завершилась ни одна стадия', () => {
        expect(
            getTotalDuration(createRecord({ 'fetch-manifest': { start: 100 } })),
        ).toBeUndefined();
    });

    it('не считает время у записи без стадий', () => {
        expect(getTotalDuration(createRecord({}))).toBeUndefined();
    });

    it('переживает запись без timings', () => {
        // такая запись могла приехать из sessionStorage от прошлой загрузки страницы
        const record = createRecord({});

        delete (record as Partial<ModuleLoadRecord>).timings;

        expect(() => getTotalDuration(record)).not.toThrow();
        expect(getTotalDuration(record)).toBeUndefined();
    });
});
