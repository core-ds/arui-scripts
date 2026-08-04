import { DEVTOOLS_STORAGE_KEY, restoreSnapshot } from '../snapshot-storage';

const VERSION = 1;

function write(snapshot: unknown) {
    sessionStorage.setItem(DEVTOOLS_STORAGE_KEY, JSON.stringify(snapshot));
}

describe('restoreSnapshot', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('возвращает пустой снимок, когда в хранилище ничего нет', () => {
        expect(restoreSnapshot(VERSION)).toEqual({ loads: [], events: [] });
    });

    it('игнорирует снимок другой версии', () => {
        write({ version: 99, loads: [{ loadId: 'a', moduleId: 'm' }], events: [] });

        expect(restoreSnapshot(VERSION).loads).toEqual([]);
    });

    it('переживает мусор вместо json', () => {
        sessionStorage.setItem(DEVTOOLS_STORAGE_KEY, '{не json');

        expect(restoreSnapshot(VERSION)).toEqual({ loads: [], events: [] });
    });

    it('отбрасывает записи без loadId и moduleId', () => {
        write({
            version: VERSION,
            loads: [
                { loadId: 'a' },
                { moduleId: 'm' },
                null,
                'строка',
                { loadId: 'b', moduleId: 'm' },
            ],
            events: [],
        });

        expect(restoreSnapshot(VERSION).loads.map((record) => record.loadId)).toEqual(['b']);
    });

    it('достраивает запись без timings, scripts и styles', () => {
        // ровно этот случай ронял панель: Object.values(undefined) бросает,
        // а падало оно уже внутри первой отрисовки
        write({ version: VERSION, loads: [{ loadId: 'a', moduleId: 'm' }], events: [] });

        const [record] = restoreSnapshot(VERSION).loads;

        expect(record.timings).toEqual({});
        expect(record.scripts).toEqual([]);
        expect(record.styles).toEqual([]);
        expect(record.status).toBe('pending');
        expect(record.shareScope).toBe('default');
        expect(record.fromCache).toBe(false);
    });

    it('выбрасывает стадии без числового start', () => {
        write({
            version: VERSION,
            loads: [
                {
                    loadId: 'a',
                    moduleId: 'm',
                    timings: {
                        'fetch-manifest': { start: 10, end: 20 },
                        'fetch-resources': { start: 'скоро' },
                        factory: null,
                        mount: { end: 5 },
                    },
                },
            ],
            events: [],
        });

        const [record] = restoreSnapshot(VERSION).loads;

        // иначе Math.min по стадиям даст NaN и водопад растянется на всю ширину
        expect(Object.keys(record.timings)).toEqual(['fetch-manifest']);
        expect(record.timings['fetch-manifest']).toEqual({ start: 10, end: 20 });
    });

    it('сохраняет нетронутыми поля, которых не касается', () => {
        write({
            version: VERSION,
            loads: [
                {
                    loadId: 'a',
                    moduleId: 'm',
                    containerId: 'container',
                    manifestUrl: 'https://example.test/manifest.json',
                    error: { stage: 'factory', message: 'boom' },
                },
            ],
            events: [],
        });

        const [record] = restoreSnapshot(VERSION).loads;

        expect(record.containerId).toBe('container');
        expect(record.manifestUrl).toBe('https://example.test/manifest.json');
        expect(record.error).toEqual({ stage: 'factory', message: 'boom' });
    });

    it('отбрасывает события без type и loadId', () => {
        write({
            version: VERSION,
            loads: [],
            events: [{ id: 1, type: 'load-start', loadId: 'a' }, { type: 'load-end' }, 42],
        });

        expect(restoreSnapshot(VERSION).events).toHaveLength(1);
    });

    it('отбрасывает события с нечисловым id', () => {
        // стор продолжает нумерацию от id последнего события: строка вместо числа
        // превратила бы `id + 1` в конкатенацию, и все новые события нарушили бы контракт
        write({
            version: VERSION,
            loads: [],
            events: [
                { id: 7, type: 'load-start', loadId: 'a' },
                { id: '8', type: 'stage-start', loadId: 'a' },
                { type: 'stage-end', loadId: 'a' },
            ],
        });

        expect(restoreSnapshot(VERSION).events.map((event) => event.id)).toEqual([7]);
    });

    it('достраивает событию поля, на которых читатель бы споткнулся', () => {
        write({
            version: VERSION,
            loads: [],
            events: [
                {
                    id: 1,
                    type: 'load-start',
                    loadId: 'a',
                    moduleId: 42,
                    timestamp: 'вчера',
                    time: null,
                    message: {},
                },
            ],
        });

        const [event] = restoreSnapshot(VERSION).events;

        expect(event.moduleId).toBe('');
        expect(event.timestamp).toBe(0);
        expect(event.time).toBe(0);
        expect(event.message).toBeUndefined();
    });
});
