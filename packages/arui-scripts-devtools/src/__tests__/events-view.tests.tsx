import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';

import { EventsView } from '../panel/events-view';
import { PageClockContext } from '../panel/page-clock';
import { type DevtoolsEvent, type ModuleLoadRecord } from '../types';

/** начало отсчёта инспектируемой страницы: панель узнаёт его из снимка, своего у неё нет */
const PAGE_ORIGIN = 1_700_000_000_000;

function createEvent(overrides: Partial<DevtoolsEvent> = {}): DevtoolsEvent {
    return {
        id: 1,
        type: 'load-start',
        loadId: 'page1-1',
        moduleId: 'module',
        timestamp: PAGE_ORIGIN + 1,
        time: 100,
        ...overrides,
    };
}

/**
 * Записи о загрузках лог получает от панели: по ним он узнаёт границы загрузок страницы.
 * В тестах достраиваем их по самим событиям - у каждого события есть loadId.
 */
function toLoads(events: DevtoolsEvent[]): ModuleLoadRecord[] {
    const byLoadId = new Map<string, ModuleLoadRecord>();

    events.forEach((event) => {
        if (byLoadId.has(event.loadId)) {
            return;
        }

        byLoadId.set(event.loadId, {
            loadId: event.loadId,
            moduleId: event.moduleId,
            hostAppId: 'host',
            status: 'loaded',
            shareScope: 'default',
            fromCache: false,
            scripts: [],
            styles: [],
            timings: {},
            startedAt: event.timestamp,
        });
    });

    return Array.from(byLoadId.values());
}

/** фильтры контролирует панель - в тестах её роль играет эта обёртка */
function EventsHarness({ events }: { events: DevtoolsEvent[] }) {
    const [query, setQuery] = useState('');
    const [onlyErrors, setOnlyErrors] = useState(false);

    return (
        <PageClockContext.Provider value={PAGE_ORIGIN}>
            <EventsView
                events={events}
                loads={toLoads(events)}
                query={query}
                onQueryChange={setQuery}
                onlyErrors={onlyErrors}
                onOnlyErrorsChange={setOnlyErrors}
            />
        </PageClockContext.Provider>
    );
}

function getRows(element: HTMLElement) {
    return Array.from(element.querySelectorAll('.row_event:not(.row_header)'));
}

function getToolbar(element: HTMLElement) {
    return {
        search: element.querySelector('.search') as HTMLInputElement,
        errorsOnly: element.querySelector('.checkbox__input') as HTMLInputElement,
        counter: element.querySelector('.toolbar__counter') as HTMLElement,
    };
}

describe('EventsView', () => {
    it('should show a placeholder when there are no events', () => {
        const { container } = render(<EventsHarness events={[]} />);

        expect(container.textContent).toContain('События ещё не записывались');
    });

    it('should render events freshest first', () => {
        const { container } = render(
            <EventsHarness
                events={[
                    createEvent({ id: 1, moduleId: 'first' }),
                    createEvent({ id: 2, moduleId: 'second' }),
                ]}
            />,
        );

        const rows = getRows(container);

        expect(rows).toHaveLength(2);
        expect(rows[0].textContent).toContain('second');
        expect(rows[1].textContent).toContain('first');
    });

    it('should render the event fields', () => {
        const { container } = render(
            <EventsHarness
                events={[
                    createEvent({
                        type: 'stage-end',
                        stage: 'fetch-manifest',
                        message: 'что-то случилось',
                        time: 1500,
                    }),
                ]}
            />,
        );

        const row = getRows(container)[0];

        expect(row.textContent).toContain('1.50 с');
        expect(row.textContent).toContain('stage-end');
        expect(row.textContent).toContain('fetch-manifest');
        expect(row.textContent).toContain('что-то случилось');
    });

    it('should show the wall clock time for events of the previous page load', () => {
        const timestamp = PAGE_ORIGIN - 1000;
        const { container } = render(
            <EventsHarness events={[createEvent({ loadId: 'page0-1', timestamp, time: 300 })]} />,
        );

        // время считается от начала загрузки страницы, а у прошлой загрузки было своё начало:
        // «300 мс» тут означало бы совсем другой момент, а часы - ровно тот
        const row = getRows(container)[0].textContent;

        expect(row).not.toContain('300 мс');
        expect(row).toContain(new Date(timestamp).toTimeString().slice(0, 8));
    });

    it('should separate the events of different page loads', () => {
        const { container } = render(
            <EventsHarness
                events={[
                    createEvent({ id: 1, loadId: 'page0-1', timestamp: PAGE_ORIGIN - 1000 }),
                    createEvent({ id: 2, loadId: 'page1-1' }),
                ]}
            />,
        );

        const separators = Array.from(container.querySelectorAll('.row_separator')).map(
            (row) => row.textContent,
        );

        expect(separators).toHaveLength(2);
        expect(separators[0]).toContain('текущая загрузка страницы');
        expect(separators[1]).toContain('предыдущая загрузка страницы');
    });

    it('should mark error events', () => {
        const { container } = render(
            <EventsHarness events={[createEvent({ type: 'error', message: 'Boom' })]} />,
        );

        expect(getRows(container)[0].classList.contains('row_error')).toBe(true);
    });

    it('should filter by module, type and message', () => {
        const { container } = render(
            <EventsHarness
                events={[
                    createEvent({ id: 1, moduleId: 'alpha' }),
                    createEvent({ id: 2, moduleId: 'beta', type: 'unmount' }),
                    createEvent({ id: 3, moduleId: 'gamma', message: 'alpha упал' }),
                ]}
            />,
        );
        const { search, counter } = getToolbar(container);

        fireEvent.change(search, { target: { value: 'alpha' } });

        expect(getRows(container)).toHaveLength(2);
        expect(counter.textContent).toBe('показано 2 из 3');

        fireEvent.change(search, { target: { value: 'unmount' } });

        expect(getRows(container)).toHaveLength(1);
    });

    it('should tell when the filter found nothing', () => {
        const { container } = render(<EventsHarness events={[createEvent()]} />);
        const { search } = getToolbar(container);

        fireEvent.change(search, { target: { value: 'ничего такого' } });

        expect(container.textContent).toContain('Ничего не нашлось');
    });

    it('should toggle the errors-only filter', () => {
        const { container } = render(
            <EventsHarness
                events={[createEvent({ id: 1 }), createEvent({ id: 2, type: 'error' })]}
            />,
        );
        const { errorsOnly } = getToolbar(container);

        fireEvent.click(errorsOnly);

        expect(getRows(container)).toHaveLength(1);
        expect(errorsOnly.checked).toBe(true);

        fireEvent.click(errorsOnly);

        expect(getRows(container)).toHaveLength(2);
        expect(errorsOnly.checked).toBe(false);
    });

    it('should label the errors-only checkbox', () => {
        const { container } = render(<EventsHarness events={[]} />);
        const { errorsOnly } = getToolbar(container);
        const label = errorsOnly.closest('label');

        // подпись должна быть частью label: клик по тексту обязан переключать фильтр,
        // а скринридер - называть чекбокс
        expect(label?.textContent).toContain('Только ошибки');
        expect(errorsOnly.type).toBe('checkbox');
    });

    it('should keep the filter when new events arrive', () => {
        const { container, rerender } = render(
            <EventsHarness events={[createEvent({ id: 1, moduleId: 'alpha' })]} />,
        );
        const { search } = getToolbar(container);

        fireEvent.change(search, { target: { value: 'alpha' } });

        rerender(
            <EventsHarness
                events={[
                    createEvent({ id: 1, moduleId: 'alpha' }),
                    createEvent({ id: 2, moduleId: 'beta' }),
                ]}
            />,
        );

        expect(getRows(container)).toHaveLength(1);
    });
});
