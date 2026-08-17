import { isCollectingEnabled } from './enabled';
import {
    type AruiEventBusDevtools,
    type EventBusEventRecord,
    type EventBusListenerCount,
    type EventBusSnapshot,
} from './types';

/** ключ в globalThis, по которому лежит оболочка devtools. Тот же, что у загрузчика модулей */
export const DEVTOOLS_GLOBAL_KEY = '__ARUI_DEVTOOLS__';
/** имя неймспейса шины внутри оболочки */
export const DEVTOOLS_EVENT_BUS_NAMESPACE = 'eventBus';
/** версия оболочки */
export const DEVTOOLS_VERSION = 1;
/** версия контракта неймспейса eventBus */
export const DEVTOOLS_EVENT_BUS_VERSION = 1;

/** размер кольцевого буфера событий */
export const EVENTS_LIMIT = 300;

/**
 * Внутреннее API записи. Не часть публичного контракта: читателям нужен только снимок.
 */
export type EventBusWriter = {
    addEvent(event: Omit<EventBusEventRecord, 'id' | 'listeners'>): void;
    addListener(bus: string, eventName: string): void;
    removeListener(bus: string, eventName: string): void;
};

export type EventBusDevtoolsStore = AruiEventBusDevtools & {
    /** @internal */
    writer: EventBusWriter;
};

type DevtoolsRoot = {
    version: number;
    [DEVTOOLS_EVENT_BUS_NAMESPACE]?: AruiEventBusDevtools;
};

type GlobalWithDevtools = typeof globalThis & {
    [DEVTOOLS_GLOBAL_KEY]?: DevtoolsRoot;
};

function createStore(): EventBusDevtoolsStore {
    let events: EventBusEventRecord[] = [];
    let listeners: EventBusListenerCount[] = [];
    /**
     * Счётчики подписок живут здесь, а не в модульной переменной: это состояние стора,
     * и пересоздание стора обязано их обнулять - иначе счётчик переживёт то, что считал.
     * EventTarget слушателей не показывает, поэтому считаем сами: все подписки проходят
     * через методы шины.
     */
    const counts = new Map<string, EventBusListenerCount>();
    let snapshot: EventBusSnapshot = {
        version: DEVTOOLS_EVENT_BUS_VERSION,
        events,
        listeners,
    };
    let counter = 0;

    const subscribers = new Set<() => void>();

    function commit() {
        snapshot = { version: DEVTOOLS_EVENT_BUS_VERSION, events, listeners };

        subscribers.forEach((subscriber) => {
            try {
                subscriber();
            } catch {
                // подписчик не должен ломать ни другие подписки, ни отправку события
            }
        });
    }

    function toKey(bus: string, eventName: string): string {
        return `${bus} ${eventName}`;
    }

    function publishCounts() {
        listeners = Array.from(counts.values());
        commit();
    }

    return {
        version: DEVTOOLS_EVENT_BUS_VERSION,
        getSnapshot() {
            return snapshot;
        },
        subscribe(subscriber) {
            subscribers.add(subscriber);

            return () => {
                subscribers.delete(subscriber);
            };
        },
        writer: {
            addEvent(event) {
                counter += 1;
                events = events
                    .concat({
                        ...event,
                        id: counter,
                        listeners: counts.get(toKey(event.bus, event.eventName))?.count ?? 0,
                    })
                    .slice(-EVENTS_LIMIT);
                commit();
            },
            addListener(bus, eventName) {
                const key = toKey(bus, eventName);
                const current = counts.get(key);

                counts.set(key, { bus, eventName, count: (current?.count ?? 0) + 1 });
                publishCounts();
            },
            removeListener(bus, eventName) {
                const key = toKey(bus, eventName);
                const count = (counts.get(key)?.count ?? 0) - 1;

                if (count > 0) {
                    counts.set(key, { bus, eventName, count });
                } else {
                    counts.delete(key);
                }

                publishCounts();
            },
        },
    };
}

function isCompatibleStore(
    store: AruiEventBusDevtools | undefined,
): store is EventBusDevtoolsStore {
    const writer = (store as EventBusDevtoolsStore | undefined)?.writer;

    return Boolean(
        store &&
            store.version === DEVTOOLS_EVENT_BUS_VERSION &&
            typeof writer?.addEvent === 'function' &&
            typeof writer?.addListener === 'function' &&
            typeof writer?.removeListener === 'function',
    );
}

/**
 * Возвращает стор неймспейса `eventBus`, создавая его при первом обращении.
 *
 * Оболочку `__ARUI_DEVTOOLS__` может создать и загрузчик модулей - кто первый пришёл, тот
 * и создал; неймспейсы независимы. Если в глобале лежит оболочка или стор несовместимой
 * версии, мы туда не лезем: писать в чужой контракт опаснее, чем не писать вовсе.
 */
export function getEventBusDevtoolsStore(): EventBusDevtoolsStore | undefined {
    if (!isCollectingEnabled() || typeof globalThis === 'undefined') {
        return undefined;
    }

    const globalObject = globalThis as GlobalWithDevtools;
    const existingRoot = globalObject[DEVTOOLS_GLOBAL_KEY];

    if (existingRoot && existingRoot.version !== DEVTOOLS_VERSION) {
        return undefined;
    }

    const root = existingRoot ?? { version: DEVTOOLS_VERSION };

    globalObject[DEVTOOLS_GLOBAL_KEY] = root;

    const existing = root[DEVTOOLS_EVENT_BUS_NAMESPACE];

    if (existing) {
        return isCompatibleStore(existing) ? existing : undefined;
    }

    const store = createStore();

    root[DEVTOOLS_EVENT_BUS_NAMESPACE] = store;

    return store;
}
