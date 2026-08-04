import { type ModuleLoadRecord } from '../contract';
import { createLoadsTable } from '../ui/table';

function createRecord(overrides: Partial<ModuleLoadRecord> = {}): ModuleLoadRecord {
    return {
        loadId: 'load-1',
        moduleId: 'module',
        hostAppId: 'host',
        status: 'loaded',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        timings: {},
        startedAt: performance.timeOrigin + 1,
        ...overrides,
    };
}

describe('createLoadsTable', () => {
    const originalGetEntriesByName = performance.getEntriesByName;

    beforeEach(() => {
        performance.getEntriesByName = jest
            .fn()
            .mockReturnValue([]) as unknown as typeof performance.getEntriesByName;
    });

    afterEach(() => {
        performance.getEntriesByName = originalGetEntriesByName;
    });

    function getRows(element: HTMLElement) {
        return Array.from(element.querySelectorAll('.row:not(.row_header)'));
    }

    it('should show a placeholder when there are no loads', () => {
        const table = createLoadsTable();

        table.update([]);

        expect(table.element.textContent).toContain('Модули ещё не загружались');
    });

    it('should render a row per load, freshest first', () => {
        const table = createLoadsTable();

        table.update([
            createRecord({ loadId: 'a', moduleId: 'first' }),
            createRecord({ loadId: 'b', moduleId: 'second' }),
        ]);

        const rows = getRows(table.element);

        expect(rows).toHaveLength(2);
        expect(rows[0].textContent).toContain('second');
        expect(rows[1].textContent).toContain('first');
    });

    it('should render the record fields', () => {
        const table = createLoadsTable();

        table.update([
            createRecord({
                moduleVersion: '1.2.3',
                containerId: 'exampleModules',
                baseUrl: 'http://localhost:8082',
                mountMode: 'compat',
                status: 'error',
                timings: { 'fetch-manifest': { start: 100, end: 350 } },
            }),
        ]);

        const row = getRows(table.element)[0];

        expect(row.textContent).toContain('ошибка');
        expect(row.textContent).toContain('1.2.3');
        expect(row.textContent).toContain('exampleModules');
        expect(row.textContent).toContain('http://localhost:8082');
        expect(row.textContent).toContain('compat');
        expect(row.textContent).toContain('250 мс');
        expect(row.classList.contains('row_error')).toBe(true);
    });

    it('should not show a duration while the module is still loading', () => {
        const table = createLoadsTable();

        table.update([
            createRecord({ status: 'pending', timings: { 'fetch-manifest': { start: 100 } } }),
        ]);

        expect(getRows(table.element)[0].textContent).toContain('—');
    });

    it('should mark records restored from the previous page load', () => {
        const table = createLoadsTable();

        table.update([createRecord({ startedAt: performance.timeOrigin - 1000 })]);

        expect(table.element.querySelector('.badge')?.textContent).toBe('прошлая загрузка');
    });

    it('should expand and collapse a row', () => {
        const table = createLoadsTable();

        table.update([
            createRecord({
                scripts: ['https://cdn.test/module.js'],
                manifestUrl: 'https://cdn.test/manifest.json',
            }),
        ]);

        expect(table.element.querySelector('.details')).toBeNull();

        (getRows(table.element)[0] as HTMLElement).click();

        const details = table.element.querySelector('.details');

        expect(details).not.toBeNull();
        expect(details?.textContent).toContain('https://cdn.test/module.js');
        expect(details?.textContent).toContain('https://cdn.test/manifest.json');
        expect(details?.textContent).toContain('нет Resource Timing');

        (getRows(table.element)[0] as HTMLElement).click();

        expect(table.element.querySelector('.details')).toBeNull();
    });

    it('should keep a row expanded across updates', () => {
        const table = createLoadsTable();

        table.update([createRecord({ status: 'pending' })]);
        (getRows(table.element)[0] as HTMLElement).click();

        table.update([createRecord({ status: 'loaded' })]);

        expect(table.element.querySelector('.details')).not.toBeNull();
        expect(getRows(table.element)[0].textContent).toContain('загружен');
    });

    it('should show resource timings in details', () => {
        performance.getEntriesByName = jest
            .fn()
            .mockReturnValue([
                { duration: 1500, transferSize: 2048 },
            ]) as unknown as typeof performance.getEntriesByName;

        const table = createLoadsTable();

        table.update([createRecord({ styles: ['https://cdn.test/module.css'] })]);
        (getRows(table.element)[0] as HTMLElement).click();

        const details = table.element.querySelector('.details');

        expect(details?.textContent).toContain('1.50 с');
        expect(details?.textContent).toContain('2.0 КБ');
    });

    it('should show the error with its stage and stack', () => {
        const table = createLoadsTable();

        table.update([
            createRecord({
                status: 'error',
                error: { stage: 'fetch-resources', message: 'Boom', stack: 'at somewhere' },
            }),
        ]);
        (getRows(table.element)[0] as HTMLElement).click();

        const details = table.element.querySelector('.details');

        expect(details?.textContent).toContain('fetch-resources');
        expect(details?.textContent).toContain('Boom');
        expect(details?.querySelector('.error__stack')?.textContent).toBe('at somewhere');
    });

    it('should not rebuild the rows when nothing shown has changed', () => {
        const table = createLoadsTable();

        table.update([createRecord({ status: 'pending' })]);

        const row = getRows(table.element)[0];

        // на одну загрузку модуля приходится больше тридцати нотификаций стора, и почти все
        // не меняют в таблице ни одной ячейки. Перерисовка на каждую из них роняет выделение
        // текста и отматывает скролл наверх - разобрать ошибку становится невозможно
        table.update([createRecord({ status: 'pending' })]);

        expect(getRows(table.element)[0]).toBe(row);
    });

    it('should redraw a row when its status changes', () => {
        const table = createLoadsTable();

        table.update([createRecord({ status: 'pending' })]);
        table.update([createRecord({ status: 'loaded' })]);

        expect(getRows(table.element)[0].textContent).toContain('загружен');
    });

    it('should redraw an expanded row when its stages advance', () => {
        const table = createLoadsTable();

        table.update([createRecord({ status: 'pending', timings: {} })]);
        (getRows(table.element)[0] as HTMLElement).click();

        expect(table.element.querySelector('.waterfall')?.textContent).toContain('нет замеров');

        table.update([
            createRecord({ status: 'pending', timings: { 'fetch-manifest': { start: 100 } } }),
        ]);

        // в строке не поменялось ничего: у незавершённой загрузки нет ни времени, ни нового
        // статуса. Но в раскрытых подробностях появилась стадия, и водопад обязан её показать
        expect(table.element.querySelector('.waterfall')?.textContent).toContain('fetch-manifest');
    });

    it('should forget rows evicted from the ring buffer', () => {
        const table = createLoadsTable();

        table.update([createRecord({ loadId: 'a' })]);
        (getRows(table.element)[0] as HTMLElement).click();

        table.update([createRecord({ loadId: 'b' })]);

        expect(table.element.querySelector('.details')).toBeNull();
    });
});
