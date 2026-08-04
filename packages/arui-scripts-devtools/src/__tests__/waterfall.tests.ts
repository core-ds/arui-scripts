import { type ModuleLoadRecord } from '../contract';
import { createWaterfall, PENDING_TICK_INTERVAL } from '../ui/waterfall';

function createRecord(
    timings: ModuleLoadRecord['timings'],
    overrides: Partial<ModuleLoadRecord> = {},
): ModuleLoadRecord {
    return {
        loadId: 'load-1',
        moduleId: 'module',
        hostAppId: 'host',
        status: 'loaded',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        timings,
        startedAt: 0,
        ...overrides,
    };
}

function getGeometry(waterfall: HTMLElement) {
    return Array.from(waterfall.querySelectorAll<HTMLElement>('.waterfall__bar')).map((bar) => ({
        left: parseFloat(bar.style.marginLeft),
        width: parseFloat(bar.style.width),
    }));
}

describe('createWaterfall', () => {
    const originalNow = performance.now;

    afterEach(() => {
        performance.now = originalNow;
        jest.useRealTimers();
    });

    it('should tell that there are no measurements', () => {
        expect(createWaterfall(createRecord({})).textContent).toContain('нет замеров');
    });

    it('should render stages in loader order, not in object order', () => {
        const waterfall = createWaterfall(
            createRecord({
                factory: { start: 300, end: 320 },
                'fetch-manifest': { start: 100, end: 150 },
            }),
        );
        const stages = Array.from(waterfall.querySelectorAll('.waterfall__stage-name')).map(
            (element) => element.textContent,
        );

        expect(stages).toEqual(['fetch-manifest', 'factory']);
    });

    it('should scale bars to the whole load and keep the gaps visible', () => {
        const waterfall = createWaterfall(
            createRecord({
                'fetch-manifest': { start: 0, end: 50 },
                factory: { start: 150, end: 200 },
            }),
        );
        const bars = Array.from(waterfall.querySelectorAll<HTMLElement>('.waterfall__bar'));

        expect(bars[0].style.marginLeft).toBe('0%');
        expect(bars[0].style.width).toBe('25%');
        // вторая стадия начинается на 75% шкалы: между стадиями модуль ждал
        expect(bars[1].style.marginLeft).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
    });

    it('should mark a stage that never finished', () => {
        const waterfall = createWaterfall(
            createRecord({
                'fetch-manifest': { start: 0, end: 50 },
                'fetch-resources': { start: 50 },
            }),
        );

        expect(waterfall.textContent).toContain('не завершилась');
        expect(waterfall.querySelectorAll('.waterfall__bar_pending')).toHaveLength(1);
    });

    it('should stretch the scale to the current moment while a stage is still running', () => {
        performance.now = (() => 150) as typeof performance.now;

        const waterfall = createWaterfall(
            createRecord(
                {
                    'fetch-manifest': { start: 0, end: 50 },
                    'fetch-resources': { start: 50 },
                },
                { status: 'pending', startedAt: performance.timeOrigin + 1 },
            ),
        );
        const [manifest, resources] = getGeometry(waterfall);

        // без «сейчас» правым краем шкалы становится начало незавершённой стадии: её полоска
        // получает marginLeft 100% и вырождается в засечку за треком - ровно там, где водопад
        // и открывают, чтобы увидеть, на чём модуль висит
        expect(manifest.width).toBeCloseTo(33.33, 1);
        expect(resources.left).toBeCloseTo(33.33, 1);
        expect(resources.width).toBeCloseTo(66.67, 1);
    });

    it('should keep every bar inside the track', () => {
        // у записи прошлой загрузки страницы своё начало отсчёта, и performance.now() к её
        // шкале не относится - незавершённая стадия всё равно должна остаться видимой
        const waterfall = createWaterfall(
            createRecord({
                'fetch-manifest': { start: 0, end: 50 },
                'fetch-resources': { start: 50 },
            }),
        );

        getGeometry(waterfall).forEach(({ left, width }) => {
            expect(width).toBeGreaterThan(0);
            expect(left + width).toBeLessThanOrEqual(100);
        });
    });

    it('should not stretch the scale of a finished load', () => {
        performance.now = (() => 100000) as typeof performance.now;

        const waterfall = createWaterfall(
            createRecord(
                { 'fetch-manifest': { start: 0, end: 50 }, factory: { start: 50, end: 100 } },
                { startedAt: performance.timeOrigin + 1 },
            ),
        );
        const [manifest] = getGeometry(waterfall);

        expect(manifest.width).toBeCloseTo(50, 5);
    });

    it('should explain what every stage means', () => {
        // названия стадий - внутренняя терминология загрузчика, по ним не догадаешься.
        // Подсказка должна быть у каждой, иначе половина водопада остаётся шарадой
        const waterfall = createWaterfall(
            createRecord({
                'fetch-manifest': { start: 0, end: 10 },
                'fetch-resources': { start: 10, end: 20 },
                'init-sharing': { start: 20, end: 21 },
                'container-init': { start: 21, end: 22 },
                'container-get': { start: 22, end: 23 },
                factory: { start: 23, end: 24 },
                mount: { start: 24, end: 25 },
            }),
        );
        const hints = Array.from(waterfall.querySelectorAll<HTMLElement>('.hint'));

        expect(hints).toHaveLength(7);
        hints.forEach((hint) => {
            expect(hint.textContent?.length).toBeGreaterThan(10);
        });
        expect(hints[0].textContent).toContain('манифест');
    });

    it('should survive stages that took no measurable time', () => {
        const waterfall = createWaterfall(createRecord({ factory: { start: 100, end: 100 } }));
        const bar = waterfall.querySelector<HTMLElement>('.waterfall__bar');

        expect(bar?.style.width).toBe('1%');
        expect(waterfall.textContent).toContain('0 мс');
    });

    it('should keep stretching a pending stage while it stays on screen', () => {
        // performance не фейкаем: от его timeOrigin зависит распознавание «прошлой загрузки»
        jest.useFakeTimers({ doNotFake: ['performance'] });

        let now = 150;

        performance.now = (() => now) as typeof performance.now;

        const waterfall = createWaterfall(
            createRecord(
                {
                    'fetch-manifest': { start: 0, end: 50 },
                    'fetch-resources': { start: 50 },
                },
                { status: 'pending', startedAt: performance.timeOrigin + 1 },
            ),
        );

        document.body.appendChild(waterfall);

        expect(waterfall.textContent).toContain('100 мс');

        now = 450;
        jest.advanceTimersByTime(PENDING_TICK_INTERVAL);

        // стор молчит, пока стадия висит, - шкала должна дорастать до «сейчас» сама
        expect(waterfall.textContent).toContain('400 мс');
        expect(getGeometry(waterfall)[0].width).toBeCloseTo((50 / 450) * 100, 1);

        waterfall.remove();
    });

    it('should stop ticking once the waterfall leaves the document', () => {
        jest.useFakeTimers({ doNotFake: ['performance'] });
        performance.now = (() => 100) as typeof performance.now;

        const waterfall = createWaterfall(
            createRecord(
                { 'fetch-manifest': { start: 0 } },
                { status: 'pending', startedAt: performance.timeOrigin + 1 },
            ),
        );

        document.body.appendChild(waterfall);
        waterfall.remove();

        jest.advanceTimersByTime(PENDING_TICK_INTERVAL);

        expect(jest.getTimerCount()).toBe(0);
    });

    it('should not tick for records of a previous page load', () => {
        // у записи из sessionStorage своё начало отсчёта, «сейчас» к её шкале не относится
        jest.useFakeTimers({ doNotFake: ['performance'] });

        const waterfall = createWaterfall(createRecord({ 'fetch-manifest': { start: 0 } }));

        document.body.appendChild(waterfall);

        expect(jest.getTimerCount()).toBe(0);

        waterfall.remove();
    });
});
