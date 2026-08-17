import { reportDispatch, reportListenerAdded, reportListenerRemoved } from './devtools/report';
import { type AbstractAppEventBus, type AbstractKnownEventTypes } from './types/abstract-types';
import { CustomEvent } from './custom-event';

export type EventBusParams = {
    targetNode?: EventTarget;
    debugMode?: boolean;
    /**
     * Ключ шины для диагностики: на странице их может быть несколько, и в расширении
     * отладки события нужно различать. Проставляется в `createBus`.
     */
    devtoolsKey?: string;
};

export class EventBus<KnownEventTypes extends AbstractKnownEventTypes>
    implements AbstractAppEventBus<KnownEventTypes>
{
    constructor({
        targetNode = document,
        debugMode = false,
        devtoolsKey = 'default',
    }: EventBusParams = {}) {
        this.debugMode = debugMode;
        this.targetNode = targetNode;
        this.devtoolsKey = devtoolsKey;
    }

    private targetNode: EventTarget;

    private debugMode: boolean;

    private devtoolsKey: string;

    private lastEventValues = {} as Record<keyof KnownEventTypes, unknown>;

    dispatchEvent<
        EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName],
    >(eventName: EventName, detail?: PayloadType): void {
        this.lastEventValues[eventName] = detail;
        // до самой отправки: если слушатель бросит, событие всё равно должно остаться в логе
        reportDispatch(this.devtoolsKey, eventName as string, detail);
        this.targetNode.dispatchEvent(new CustomEvent(eventName as string, { detail }));

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
        reportListenerAdded(this.devtoolsKey, eventName as string);
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
        reportListenerRemoved(this.devtoolsKey, eventName as string);
    }
}

/* eslint-disable no-underscore-dangle */
export function createBus(
    key: string,
    params: EventBusParams = {},
): EventBus<AbstractKnownEventTypes> {
    if (typeof window === 'undefined') {
        throw new Error('Client event bus can only be created in a browser environment');
    }

    if (!window.__alfa_event_buses) {
        window.__alfa_event_buses = {};
    }
    if (!window.__alfa_event_buses[key]) {
        window.__alfa_event_buses[key] = new EventBus({ devtoolsKey: key, ...params });
    }

    return window.__alfa_event_buses[key] as EventBus<AbstractKnownEventTypes>;
}

/* eslint-enable no-underscore-dangle */
