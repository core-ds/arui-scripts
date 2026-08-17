import { type ModuleLoadRecord } from '../types';
import { buildTimeline } from '../utils/timeline';

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
        startedAt: performance.timeOrigin + 1,
        ...overrides,
    };
}

describe('buildTimeline', () => {
    const originalNow = performance.now;

    afterEach(() => {
        performance.now = originalNow;
    });

    it('should return an empty scale when there is nothing measured', () => {
        expect(buildTimeline([])).toEqual({ from: 0, to: 0, duration: 0, rows: [] });
    });

    it('should skip records without timings', () => {
        expect(buildTimeline([createRecord('a', {})]).rows).toEqual([]);
    });

    it('should skip records of the previous page load', () => {
        // у них своё начало отсчёта: на одной шкале с текущими они окажутся где угодно
        const previous = createRecord(
            'a',
            { 'fetch-manifest': { start: 0, end: 10 } },
            { startedAt: performance.timeOrigin - 1000 },
        );

        expect(buildTimeline([previous]).rows).toEqual([]);
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
        performance.now = (() => 500) as typeof performance.now;

        const timeline = buildTimeline([
            createRecord('a', { 'fetch-resources': { start: 100 } }, { status: 'pending' }),
        ]);

        expect(timeline.rows[0].pending).toBe(true);
        expect(timeline.rows[0].duration).toBe(400);
    });

    it('should keep a zero-length load visible', () => {
        const timeline = buildTimeline([
            createRecord('a', { 'fetch-manifest': { start: 100, end: 100 } }),
        ]);

        expect(timeline.rows[0].width).toBe(1);
    });
});
