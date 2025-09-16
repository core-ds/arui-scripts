import { type AbstractAppEventBus, type AbstractKnownEventTypes } from './types/abstract-types';
import { CustomEvent } from './custom-event';

export class EventBus<KnownEventTypes extends AbstractKnownEventTypes>
    implements AbstractAppEventBus<KnownEventTypes>
{
    constructor({ targetNode = document, debugMode = false }: EventBusParams = {}) {
        this.debugMode = debugMode;
        this.targetNode = targetNode;
    }

    private targetNode: Node;

    private debugMode: boolean;

    private lastEventValues = {} as Record<keyof KnownEventTypes, unknown>;

    dispatchEvent<
        EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName],
    >(eventName: EventName, detail?: PayloadType): void {
        this.targetNode.dispatchEvent(new CustomEvent(eventName as string, { detail }));
        this.lastEventValues[eventName] = detail;

        if (this.debugMode) {
            // eslint-disable-next-line no-console
            console.debug(`Event bus, dispatchEvent: ${eventName.toString()}`, detail);
        }
    }

    getLastEventDetail<
        EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName],
    >(eventName: EventName): PayloadType | undefined {
        return this.lastEventValues[eventName] as PayloadType | undefined;
    }

    addEventListener<
        EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName],
    >(
        eventName: EventName,
        eventHandler: (event: CustomEvent<PayloadType>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.targetNode.addEventListener(
            eventName as string,
            eventHandler as EventListener,
            options,
        );
    }

    addEventListenerAndGetLast<
        EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName],
    >(
        eventName: EventName,
        eventHandler: (event: CustomEvent<PayloadType>) => void,
        options?: boolean | AddEventListenerOptions,
    ): PayloadType | undefined {
        this.addEventListener(eventName, eventHandler, options);

        return this.getLastEventDetail(eventName);
    }

    removeEventListener<
        EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName],
    >(
        eventName: EventName,
        eventHandler: (event: CustomEvent<PayloadType>) => void,
        options?: EventListenerOptions | boolean,
    ): void {
        this.targetNode.removeEventListener(
            eventName as string,
            eventHandler as unknown as EventListener,
            options,
        );
    }
}

/* eslint-disable no-underscore-dangle */
export function createBus(
    key: string,
    params: EventBusParams = {},
): EventBus<AbstractKnownEventTypes> {
    if (!window.__alfa_event_buses) {
        window.__alfa_event_buses = {};
    }
    if (!window.__alfa_event_buses[key]) {
        window.__alfa_event_buses[key] = new EventBus(params);
    }

    return window.__alfa_event_buses[key] as EventBus<AbstractKnownEventTypes>;
}

/* eslint-enable no-underscore-dangle */
