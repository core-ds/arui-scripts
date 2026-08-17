import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';

import { LoadsTable } from '../panel/loads-table';
import { type ModuleLoadRecord } from '../types';

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

/** раскрытые строки контролирует панель - в тестах её роль играет эта обёртка */
function TableHarness({ loads }: { loads: ModuleLoadRecord[] }) {
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

    return (
        <LoadsTable
            loads={loads}
            expanded={expanded}
            onToggle={(loadId) =>
                setExpanded((previous) => {
                    const next = new Set(previous);

                    if (next.has(loadId)) {
                        next.delete(loadId);
                    } else {
                        next.add(loadId);
                    }

                    return next;
                })
            }
        />
    );
}

describe('LoadsTable', () => {
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
        const { container } = render(<TableHarness loads={[]} />);

        expect(container.textContent).toContain('Модули ещё не загружались');
    });

    it('should render a row per load, freshest first', () => {
        const { container } = render(
            <TableHarness
                loads={[
                    createRecord({ loadId: 'a', moduleId: 'first' }),
                    createRecord({ loadId: 'b', moduleId: 'second' }),
                ]}
            />,
        );

        const rows = getRows(container);

        expect(rows).toHaveLength(2);
        expect(rows[0].textContent).toContain('second');
        expect(rows[1].textContent).toContain('first');
    });

    it('should render the record fields', () => {
        const { container } = render(
            <TableHarness
                loads={[
                    createRecord({
                        moduleVersion: '1.2.3',
                        containerId: 'exampleModules',
                        baseUrl: 'http://localhost:8082',
                        mountMode: 'compat',
                        status: 'error',
                        timings: { 'fetch-manifest': { start: 100, end: 350 } },
                    }),
                ]}
            />,
        );

        const row = getRows(container)[0];

        expect(row.textContent).toContain('ошибка');
        expect(row.textContent).toContain('1.2.3');
        expect(row.textContent).toContain('exampleModules');
        expect(row.textContent).toContain('http://localhost:8082');
        expect(row.textContent).toContain('compat');
        expect(row.textContent).toContain('250 мс');
        expect(row.classList.contains('row_error')).toBe(true);
    });

    it('should not show a duration while the module is still loading', () => {
        const { container } = render(
            <TableHarness
                loads={[
                    createRecord({
                        status: 'pending',
                        timings: { 'fetch-manifest': { start: 100 } },
                    }),
                ]}
            />,
        );

        expect(getRows(container)[0].textContent).toContain('—');
    });

    it('should mark records restored from the previous page load', () => {
        const { container } = render(
            <TableHarness loads={[createRecord({ startedAt: performance.timeOrigin - 1000 })]} />,
        );

        expect(container.querySelector('.badge')?.textContent).toBe('прошлая загрузка');
    });

    it('should expand and collapse a row', () => {
        const { container } = render(
            <TableHarness
                loads={[
                    createRecord({
                        scripts: ['https://cdn.test/module.js'],
                        manifestUrl: 'https://cdn.test/manifest.json',
                    }),
                ]}
            />,
        );

        expect(container.querySelector('.details')).toBeNull();

        fireEvent.click(getRows(container)[0]);

        const details = container.querySelector('.details');

        expect(details).not.toBeNull();
        expect(details?.textContent).toContain('https://cdn.test/module.js');
        expect(details?.textContent).toContain('https://cdn.test/manifest.json');
        expect(details?.textContent).toContain('нет Resource Timing');

        fireEvent.click(getRows(container)[0]);

        expect(container.querySelector('.details')).toBeNull();
    });

    it('should keep a row expanded across updates', () => {
        const { container, rerender } = render(
            <TableHarness loads={[createRecord({ status: 'pending' })]} />,
        );

        fireEvent.click(getRows(container)[0]);

        rerender(<TableHarness loads={[createRecord({ status: 'loaded' })]} />);

        expect(container.querySelector('.details')).not.toBeNull();
        expect(getRows(container)[0].textContent).toContain('загружен');
    });

    it('should show resource timings in details', () => {
        performance.getEntriesByName = jest
            .fn()
            .mockReturnValue([
                { duration: 1500, transferSize: 2048 },
            ]) as unknown as typeof performance.getEntriesByName;

        const { container } = render(
            <TableHarness loads={[createRecord({ styles: ['https://cdn.test/module.css'] })]} />,
        );

        fireEvent.click(getRows(container)[0]);

        const details = container.querySelector('.details');

        expect(details?.textContent).toContain('1.50 с');
        expect(details?.textContent).toContain('2.0 КБ');
    });

    it('should show the error with its stage and stack', () => {
        const { container } = render(
            <TableHarness
                loads={[
                    createRecord({
                        status: 'error',
                        error: {
                            stage: 'fetch-resources',
                            message: 'Boom',
                            stack: 'at somewhere',
                        },
                    }),
                ]}
            />,
        );

        fireEvent.click(getRows(container)[0]);

        const details = container.querySelector('.details');

        expect(details?.textContent).toContain('fetch-resources');
        expect(details?.textContent).toContain('Boom');
        expect(details?.querySelector('.error__stack')?.textContent).toBe('at somewhere');
    });

    it('should keep the row node when nothing shown has changed', () => {
        const { container, rerender } = render(
            <TableHarness loads={[createRecord({ status: 'pending' })]} />,
        );

        const row = getRows(container)[0];

        // на одну загрузку модуля приходится больше тридцати нотификаций стора. Узел строки
        // обязан переживать их: пересоздание роняет выделение текста и позицию скролла
        rerender(<TableHarness loads={[createRecord({ status: 'pending' })]} />);

        expect(getRows(container)[0]).toBe(row);
    });

    it('should redraw a row when its status changes', () => {
        const { container, rerender } = render(
            <TableHarness loads={[createRecord({ status: 'pending' })]} />,
        );

        rerender(<TableHarness loads={[createRecord({ status: 'loaded' })]} />);

        expect(getRows(container)[0].textContent).toContain('загружен');
    });

    it('should redraw an expanded row when its stages advance', () => {
        const { container, rerender } = render(
            <TableHarness loads={[createRecord({ status: 'pending', timings: {} })]} />,
        );

        fireEvent.click(getRows(container)[0]);

        expect(container.querySelector('.waterfall')?.textContent).toContain('нет замеров');

        rerender(
            <TableHarness
                loads={[
                    createRecord({
                        status: 'pending',
                        timings: { 'fetch-manifest': { start: 100 } },
                    }),
                ]}
            />,
        );

        // в строке не поменялось ничего: у незавершённой загрузки нет ни времени, ни нового
        // статуса. Но в раскрытых подробностях появилась стадия, и водопад обязан её показать
        expect(container.querySelector('.waterfall')?.textContent).toContain('fetch-manifest');
    });

    it('should forget rows evicted from the ring buffer', () => {
        const { container, rerender } = render(
            <TableHarness loads={[createRecord({ loadId: 'a' })]} />,
        );

        fireEvent.click(getRows(container)[0]);

        rerender(<TableHarness loads={[createRecord({ loadId: 'b' })]} />);

        expect(container.querySelector('.details')).toBeNull();
    });
});
