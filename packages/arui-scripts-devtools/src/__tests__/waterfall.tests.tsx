import { act } from 'react';
import { render } from '@testing-library/react';

import { PENDING_TICK_INTERVAL } from '../constants';
import { PageClockContext } from '../panel/page-clock';
import { Waterfall } from '../panel/waterfall';
import { type ModuleLoadRecord } from '../types';

/** начало отсчёта инспектируемой страницы: панель узнаёт его из снимка, своего у неё нет */
const PAGE_ORIGIN = 1_700_000_000_000;

/** «сейчас» на часах страницы панель считает как `Date.now()` минус её начало отсчёта */
function setPageNow(now: number) {
    jest.spyOn(Date, 'now').mockReturnValue(PAGE_ORIGIN + now);
}

function renderWaterfall(record: ModuleLoadRecord) {
    return render(
        <PageClockContext.Provider value={PAGE_ORIGIN}>
            <Waterfall record={record} />
        </PageClockContext.Provider>,
    );
}

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

function getGeometry(container: HTMLElement) {
    return Array.from(container.querySelectorAll<HTMLElement>('.waterfall__bar')).map((bar) => ({
        left: parseFloat(bar.style.marginLeft),
        width: parseFloat(bar.style.width),
    }));
}

describe('Waterfall', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('should tell that there are no measurements', () => {
        const { container } = render(<Waterfall record={createRecord({})} />);

        expect(container.textContent).toContain('нет замеров');
    });

    it('should render stages in loader order, not in object order', () => {
        const { container } = render(
            <Waterfall
                record={createRecord({
                    factory: { start: 300, end: 320 },
                    'fetch-manifest': { start: 100, end: 150 },
                })}
            />,
        );
        const stages = Array.from(container.querySelectorAll('.waterfall__stage-name')).map(
            (element) => element.textContent,
        );

        expect(stages).toEqual(['fetch-manifest', 'factory']);
    });

    it('should scale bars to the whole load and keep the gaps visible', () => {
        const { container } = render(
            <Waterfall
                record={createRecord({
                    'fetch-manifest': { start: 0, end: 50 },
                    factory: { start: 150, end: 200 },
                })}
            />,
        );
        const bars = Array.from(container.querySelectorAll<HTMLElement>('.waterfall__bar'));

        expect(bars[0].style.marginLeft).toBe('0%');
        expect(bars[0].style.width).toBe('25%');
        // вторая стадия начинается на 75% шкалы: между стадиями модуль ждал
        expect(bars[1].style.marginLeft).toBe('75%');
        expect(bars[1].style.width).toBe('25%');
    });

    it('should mark a stage that never finished', () => {
        const { container } = render(
            <Waterfall
                record={createRecord({
                    'fetch-manifest': { start: 0, end: 50 },
                    'fetch-resources': { start: 50 },
                })}
            />,
        );

        expect(container.textContent).toContain('не завершилась');
        expect(container.querySelectorAll('.waterfall__bar_pending')).toHaveLength(1);
    });

    it('should stretch the scale to the current moment while a stage is still running', () => {
        setPageNow(150);

        const { container } = renderWaterfall(
            createRecord(
                {
                    'fetch-manifest': { start: 0, end: 50 },
                    'fetch-resources': { start: 50 },
                },
                { status: 'pending', startedAt: PAGE_ORIGIN + 1 },
            ),
        );
        const [manifest, resources] = getGeometry(container);

        // без «сейчас» правым краем шкалы становится начало незавершённой стадии: её полоска
        // получает marginLeft 100% и вырождается в засечку за треком - ровно там, где водопад
        // и открывают, чтобы увидеть, на чём модуль висит
        expect(manifest.width).toBeCloseTo(33.33, 1);
        expect(resources.left).toBeCloseTo(33.33, 1);
        expect(resources.width).toBeCloseTo(66.67, 1);
    });

    it('should keep every bar inside the track', () => {
        // у записи прошлой загрузки страницы своё начало отсчёта, и «сейчас» к её шкале
        // не относится - незавершённая стадия всё равно должна остаться видимой
        setPageNow(10_000);

        const { container } = renderWaterfall(
            createRecord(
                {
                    'fetch-manifest': { start: 0, end: 50 },
                    'fetch-resources': { start: 50 },
                },
                { startedAt: PAGE_ORIGIN - 1000 },
            ),
        );

        getGeometry(container).forEach(({ left, width }) => {
            expect(width).toBeGreaterThan(0);
            expect(left + width).toBeLessThanOrEqual(100);
        });
    });

    it('should not stretch the scale of a finished load', () => {
        setPageNow(100_000);

        const { container } = renderWaterfall(
            createRecord(
                {
                    'fetch-manifest': { start: 0, end: 50 },
                    factory: { start: 50, end: 100 },
                },
                { startedAt: PAGE_ORIGIN + 1 },
            ),
        );
        const [manifest] = getGeometry(container);

        expect(manifest.width).toBeCloseTo(50, 5);
    });

    it('should explain what every stage means', () => {
        // названия стадий - внутренняя терминология загрузчика, по ним не догадаешься.
        // Подсказка должна быть у каждой, иначе половина водопада остаётся шарадой
        const { container } = render(
            <Waterfall
                record={createRecord({
                    'fetch-manifest': { start: 0, end: 10 },
                    'fetch-resources': { start: 10, end: 20 },
                    'init-sharing': { start: 20, end: 21 },
                    'container-init': { start: 21, end: 22 },
                    'container-get': { start: 22, end: 23 },
                    factory: { start: 23, end: 24 },
                    mount: { start: 24, end: 25 },
                })}
            />,
        );
        const hints = Array.from(container.querySelectorAll<HTMLElement>('.hint'));

        expect(hints).toHaveLength(7);
        hints.forEach((hint) => {
            expect(hint.textContent?.length).toBeGreaterThan(10);
        });
        expect(hints[0].textContent).toContain('манифест');
    });

    it('should survive stages that took no measurable time', () => {
        const { container } = render(
            <Waterfall record={createRecord({ factory: { start: 100, end: 100 } })} />,
        );
        const bar = container.querySelector<HTMLElement>('.waterfall__bar');

        expect(bar?.style.width).toBe('1%');
        expect(container.textContent).toContain('0 мс');
    });

    it('should keep stretching a pending stage while it stays on screen', () => {
        jest.useFakeTimers();
        setPageNow(150);

        const { container } = renderWaterfall(
            createRecord(
                {
                    'fetch-manifest': { start: 0, end: 50 },
                    'fetch-resources': { start: 50 },
                },
                { status: 'pending', startedAt: PAGE_ORIGIN + 1 },
            ),
        );

        expect(container.textContent).toContain('100 мс');

        setPageNow(450);
        act(() => {
            jest.advanceTimersByTime(PENDING_TICK_INTERVAL);
        });

        // стор молчит, пока стадия висит, - шкала должна дорастать до «сейчас» сама
        expect(container.textContent).toContain('400 мс');
        expect(getGeometry(container)[0].width).toBeCloseTo((50 / 450) * 100, 1);
    });

    it('should stop ticking once the waterfall is unmounted', () => {
        jest.useFakeTimers();
        setPageNow(100);

        const { unmount } = renderWaterfall(
            createRecord(
                { 'fetch-manifest': { start: 0 } },
                { status: 'pending', startedAt: PAGE_ORIGIN + 1 },
            ),
        );

        unmount();

        expect(jest.getTimerCount()).toBe(0);
    });

    it('should not tick for records of a previous page load', () => {
        // у записи из sessionStorage своё начало отсчёта, «сейчас» к её шкале не относится
        jest.useFakeTimers();

        renderWaterfall(
            createRecord({ 'fetch-manifest': { start: 0 } }, { startedAt: PAGE_ORIGIN - 1000 }),
        );

        expect(jest.getTimerCount()).toBe(0);
    });

    it('should not tick while the page clock is unknown', () => {
        // страница ещё не ответила: показывать нечего, но и дорисовывать нечего тоже
        jest.useFakeTimers();

        render(
            <Waterfall
                record={createRecord(
                    { 'fetch-manifest': { start: 0 } },
                    { status: 'pending', startedAt: PAGE_ORIGIN + 1 },
                )}
            />,
        );

        expect(jest.getTimerCount()).toBe(0);
    });
});
