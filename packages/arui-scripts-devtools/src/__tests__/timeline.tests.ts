import { type ModuleLoadRecord } from '../types';
import { buildTimeline } from '../utils/timeline';

/** начало отсчёта инспектируемой страницы: панель узнаёт его из снимка, своего у неё нет */
const PAGE_ORIGIN = 1_700_000_000_000;

function createRecord(
    loadId: string,
    timings: ModuleLoadRecord['timings'],
    overrides: Partial<ModuleLoadRecord> = {},
): ModuleLoadRecord {
    return {
        loadId,
        moduleId: `module-${loadId}`,
        hostAppId: 'host',
        status: 'loaded',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        timings,
        startedAt: PAGE_ORIGIN + 1,
        ...overrides,
    };
}

describe('buildTimeline', () => {
    it('should return an empty scale when there is nothing measured', () => {
        expect(buildTimeline([])).toEqual({ from: 0, to: 0, duration: 0, rows: [] });
    });

    it('should skip records without timings', () => {
        expect(buildTimeline([createRecord('a', {})]).rows).toEqual([]);
    });

    it('should lay loads out on a shared axis', () => {
        const timeline = buildTimeline([
            createRecord('a', { 'fetch-manifest': { start: 0, end: 100 } }),
            createRecord('b', { 'fetch-manifest': { start: 100, end: 200 } }),
        ]);

        expect(timeline.from).toBe(0);
        expect(timeline.to).toBe(200);
        expect(timeline.rows[0]).toMatchObject({ offset: 0, width: 50, duration: 100 });
        expect(timeline.rows[1]).toMatchObject({ offset: 50, width: 50, duration: 100 });
    });

    it('should show overlapping loads as overlapping bars', () => {
        // ради этого таймлайн и нужен: параллельность видно сразу, а не по числам в логе
        const timeline = buildTimeline([
            createRecord('a', { 'fetch-manifest': { start: 0, end: 100 } }),
            createRecord('b', { 'fetch-manifest': { start: 50, end: 150 } }),
        ]);

        const [first, second] = timeline.rows;

        expect(second.offset).toBeLessThan(first.offset + first.width);
    });

    it('should order rows by start time, not by buffer order', () => {
        const timeline = buildTimeline([
            createRecord('late', { 'fetch-manifest': { start: 300, end: 400 } }),
            createRecord('early', { 'fetch-manifest': { start: 0, end: 100 } }),
        ]);

        expect(timeline.rows.map((row) => row.record.loadId)).toEqual(['early', 'late']);
    });

    it('should span a load from its first stage to its last', () => {
        const timeline = buildTimeline([
            createRecord('a', {
                'fetch-manifest': { start: 10, end: 20 },
                mount: { start: 80, end: 100 },
            }),
        ]);

        expect(timeline.rows[0].duration).toBe(90);
    });

    it('should stretch a pending load to the current moment', () => {
        const timeline = buildTimeline(
            [createRecord('a', { 'fetch-resources': { start: 100 } }, { status: 'pending' })],
            500,
        );

        expect(timeline.rows[0].pending).toBe(true);
        expect(timeline.rows[0].duration).toBe(400);
    });

    it('should leave a pending load at its last mark without a current moment', () => {
        // «сейчас» есть только у текущей загрузки страницы: у восстановленной из sessionStorage
        // свой отсчёт, и дорисовывать ей хвост до текущего момента значило бы врать
        const timeline = buildTimeline([
            createRecord('a', { 'fetch-resources': { start: 100 } }, { status: 'pending' }),
        ]);

        expect(timeline.rows[0].pending).toBe(true);
        expect(timeline.rows[0].duration).toBe(0);
    });

    it('should skip a record whose stages carry no numbers', () => {
        // так выглядит снимок, восстановленный из sessionStorage другой версией загрузчика:
        // ключи стадий на месте, значений нет
        const broken = createRecord('a', {
            mount: undefined,
            factory: null,
        } as unknown as ModuleLoadRecord['timings']);

        expect(buildTimeline([broken]).rows).toEqual([]);
    });

    it('should not let one broken record wreck the whole scale', () => {
        // до починки NaN расползался по общей шкале, и полоска здоровой загрузки
        // получала ширину в тысячи процентов
        const broken = createRecord('broken', {
            mount: { start: 'скоро' },
        } as unknown as ModuleLoadRecord['timings']);
        const healthy = createRecord('ok', { 'fetch-manifest': { start: 0, end: 50 } });

        const timeline = buildTimeline([broken, healthy]);

        expect(timeline.rows).toHaveLength(1);
        expect(timeline.rows[0].record.loadId).toBe('ok');
        expect(timeline.rows[0].width).toBe(100);
    });

    it('should keep every bar inside the track', () => {
        const timeline = buildTimeline([
            createRecord('a', { 'fetch-manifest': { start: 0, end: 100 } }),
            createRecord('b', { 'fetch-manifest': { start: 40, end: 60 } }),
        ]);

        timeline.rows.forEach((row) => {
            expect(row.offset).toBeGreaterThanOrEqual(0);
            expect(row.offset + row.width).toBeLessThanOrEqual(100);
        });
    });

    it('should ignore a stage whose end is not a number', () => {
        const timeline = buildTimeline([
            createRecord('a', {
                'fetch-manifest': { start: 0, end: 50 },
                mount: { start: 60, end: 'потом' },
            } as unknown as ModuleLoadRecord['timings']),
        ]);

        // стадия с нечисловым концом считается незавершённой, а не выбрасывается целиком
        expect(timeline.rows[0].pending).toBe(true);
    });

    it('should keep a zero-length load visible', () => {
        const timeline = buildTimeline([
            createRecord('a', { 'fetch-manifest': { start: 100, end: 100 } }),
        ]);

        expect(timeline.rows[0].width).toBe(1);
    });
});
