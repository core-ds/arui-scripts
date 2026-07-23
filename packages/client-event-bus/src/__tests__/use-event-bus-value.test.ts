import { act, renderHook } from '@testing-library/react';

import { EventBus } from '../implementation';
import { type AbstractAppEventBus } from '../types/abstract-types';
import { useEventBusValue } from '../use-event-bus-value';

type EventList = {
    anotherEvent: string;
    testEvent: string;
};

type HookProps = {
    bus: AbstractAppEventBus<EventList> | null;
};

describe('useEventBusValue', () => {
    it('reads the latest value when the event bus becomes available', () => {
        const eventBus = new EventBus<EventList>();
        const initialProps: HookProps = { bus: null };
        const { result, rerender } = renderHook(
            ({ bus }: HookProps) => useEventBusValue<EventList, 'testEvent'>(bus, 'testEvent'),
            { initialProps },
        );

        eventBus.dispatchEvent('testEvent', 'latest value');
        rerender({ bus: eventBus });

        expect(result.current).toBe('latest value');
    });

    it('updates the value when an event is dispatched', () => {
        const eventBus = new EventBus<EventList>();
        const { result } = renderHook(() =>
            useEventBusValue<EventList, 'testEvent'>(eventBus, 'testEvent'),
        );

        act(() => {
            eventBus.dispatchEvent('testEvent', 'updated value');
        });

        expect(result.current).toBe('updated value');
    });

    it('reads the snapshot for a new event name', () => {
        const eventBus = new EventBus<EventList>();

        eventBus.dispatchEvent('testEvent', 'first value');
        eventBus.dispatchEvent('anotherEvent', 'second value');

        const { result, rerender } = renderHook(
            ({ eventName }: { eventName: keyof EventList }) =>
                useEventBusValue<EventList, keyof EventList>(eventBus, eventName),
            { initialProps: { eventName: 'testEvent' as keyof EventList } },
        );

        rerender({ eventName: 'anotherEvent' });

        expect(result.current).toBe('second value');
    });
});
