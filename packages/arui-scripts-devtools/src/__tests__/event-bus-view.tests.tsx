import { render } from '@testing-library/react';

import { EventBusView } from '../panel/event-bus-view';
import {
    type EventBusEventRecord,
    type EventBusListenerCount,
    type EventBusStoreState,
} from '../types';

function createEvent(
    id: number,
    bus: string,
    eventName: string,
    overrides: Partial<EventBusEventRecord> = {},
): EventBusEventRecord {
    return {
        id,
        bus,
        eventName,
        payload: undefined,
        listeners: 1,
        timestamp: 0,
        time: id,
        ...overrides,
    };
}

function renderView(
    events: EventBusEventRecord[],
    listeners: EventBusListenerCount[] = [],
    state?: EventBusStoreState,
) {
    return render(
        <EventBusView
            state={state ?? { status: 'ready', snapshot: { version: 1, events, listeners } }}
            query=''
            onQueryChange={() => undefined}
        />,
    );
}

describe('EventBusView', () => {
    it('should wait for the bus to show up', () => {
        const { container } = renderView([], [], { status: 'waiting' });

        expect(container.textContent).toContain('Ждём событийную шину');
    });

    it('should ask to update the older side on a version mismatch', () => {
        const { container } = renderView([], [], { status: 'unsupported', found: 9, supported: 1 });

        expect(container.textContent).toContain('версии 9');
        expect(container.textContent).toContain('умеет читать 1');
    });

    it('should show the newest events first', () => {
        const { container } = renderView([
            createEvent(1, 'app', 'first'),
            createEvent(2, 'app', 'second'),
        ]);

        const rows = container.querySelectorAll('.row_bus:not(.row_header)');

        expect(rows[0].textContent).toContain('second');
    });

    it('should mark an event nobody received', () => {
        const { container } = renderView([createEvent(1, 'app', 'ready', { listeners: 0 })]);

        expect(container.querySelector('.row_bus_unheard')).not.toBeNull();
    });

    it('should not call a listener silent because of a namesake in another bus', () => {
        // до починки шина не сравнивалась: событие `ready` в шине `app` считалось ответом
        // на подписку `ready` в шине `module`, и настоящая тишина оставалась незамеченной
        const { container } = renderView(
            [createEvent(1, 'app', 'ready')],
            [{ bus: 'module', eventName: 'ready', count: 3 }],
        );

        expect(container.querySelector('.bus-listeners')?.textContent).toBe(
            'Подписки без единого события: module · ready (3)',
        );
    });

    it('should stay quiet when the listener did get its event', () => {
        const { container } = renderView(
            [createEvent(1, 'module', 'ready')],
            [{ bus: 'module', eventName: 'ready', count: 3 }],
        );

        expect(container.querySelector('.bus-listeners')).toBeNull();
    });

    it('should describe a payload that could not be serialized', () => {
        const circular: Record<string, unknown> = {};

        circular.self = circular;

        const { container } = renderView([createEvent(1, 'app', 'ready', { payload: circular })]);

        expect(container.textContent).toContain('[несериализуемо]');
    });
});
