import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';

import { EventsView } from '../panel/events-view';
import { type DevtoolsEvent } from '../types';

function createEvent(overrides: Partial<DevtoolsEvent> = {}): DevtoolsEvent {
    return {
        id: 1,
        type: 'load-start',
        loadId: 'load-1',
        moduleId: 'module',
        timestamp: performance.timeOrigin + 1,
        time: 100,
        ...overrides,
    };
}

/** фильтры контролирует панель - в тестах её роль играет эта обёртка */
function EventsHarness({ events }: { events: DevtoolsEvent[] }) {
    const [query, setQuery] = useState('');
    const [onlyErrors, setOnlyErrors] = useState(false);

    return (
        <EventsView
            events={events}
            query={query}
            onQueryChange={setQuery}
            onlyErrors={onlyErrors}
            onOnlyErrorsChange={setOnlyErrors}
        />
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

    it('should not show a page-relative time for events of the previous page load', () => {
        const { container } = render(
            <EventsHarness
                events={[createEvent({ timestamp: performance.timeOrigin - 1000, time: 300 })]}
            />,
        );

        // время считается от начала загрузки страницы, а у прошлой загрузки было своё начало
        expect(getRows(container)[0].textContent).not.toContain('300 мс');
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
