import { useEffect, useState } from 'react';

import { type AbstractAppEventBus, type AbstractKnownEventTypes } from './types/abstract-types';

export function useEventBusValue<
    EventTypes extends AbstractKnownEventTypes,
    Event extends keyof EventTypes,
>(
    eventBus: AbstractAppEventBus<EventTypes> | undefined | null,
    eventName: Event,
): EventTypes[Event] | undefined {
    const [lastValue, setLastValue] = useState(eventBus?.getLastEventDetail?.(eventName));

    useEffect(() => {
        const eventHandler = (event: CustomEvent<EventTypes[Event]>) => setLastValue(event.detail);

        eventBus?.addEventListener?.(eventName, eventHandler);

        return () => {
            eventBus?.removeEventListener?.(eventName, eventHandler);
        };
    }, [eventBus, eventName, setLastValue]);

    return lastValue;
}
