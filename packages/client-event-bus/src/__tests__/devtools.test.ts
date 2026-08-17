import {
    type AruiEventBusDevtools,
    DEVTOOLS_EVENT_BUS_NAMESPACE,
    DEVTOOLS_GLOBAL_KEY,
    getEventBusDevtoolsStore,
} from '../devtools';
import { serializePayload } from '../devtools/serialize';
import { EventBus } from '../implementation';

type GlobalWithDevtools = typeof globalThis & {
    [DEVTOOLS_GLOBAL_KEY]?: {
        version: number;
        [DEVTOOLS_EVENT_BUS_NAMESPACE]?: AruiEventBusDevtools;
    };
};

const globalWithDevtools = globalThis as GlobalWithDevtools;

function getSnapshot() {
    const store = getEventBusDevtoolsStore();

    if (!store) {
        throw new Error('store is expected to be created');
    }

    return store.getSnapshot();
}

describe('event bus devtools', () => {
    beforeEach(() => {
        delete globalWithDevtools[DEVTOOLS_GLOBAL_KEY];
    });

    afterEach(() => {
        delete globalWithDevtools[DEVTOOLS_GLOBAL_KEY];
    });

    it('should record a dispatched event', () => {
        const bus = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'app' });

        bus.dispatchEvent('user:login', { id: 42 });

        expect(getSnapshot().events).toMatchObject([
            { bus: 'app', eventName: 'user:login', payload: { id: 42 }, listeners: 0 },
        ]);
    });

    it('should count the listeners an event reached', () => {
        // ровно тот вопрос, ради которого вкладка и нужна: событие ушло, а кто его получил
        const bus = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'app' });

        bus.addEventListener('user:login', () => undefined);
        bus.addEventListener('user:login', () => undefined);
        bus.dispatchEvent('user:login');

        expect(getSnapshot().events[0].listeners).toBe(2);
    });

    it('should show a dispatch nobody was listening to', () => {
        const bus = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'app' });

        bus.dispatchEvent('user:login');

        expect(getSnapshot().events[0].listeners).toBe(0);
    });

    it('should keep the current subscriptions', () => {
        const bus = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'app' });
        const handler = () => undefined;

        bus.addEventListener('user:login', handler);

        expect(getSnapshot().listeners).toEqual([
            { bus: 'app', eventName: 'user:login', count: 1 },
        ]);

        bus.removeEventListener('user:login', handler);

        expect(getSnapshot().listeners).toEqual([]);
    });

    it('should tell buses apart', () => {
        // на странице их может быть несколько, и события надо различать
        const first = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'host' });
        const second = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'module' });

        first.dispatchEvent('ping');
        second.dispatchEvent('ping');

        expect(getSnapshot().events.map((event) => event.bus)).toEqual(['host', 'module']);
    });

    it('should notify subscribers of the store', () => {
        const bus = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'app' });
        const store = getEventBusDevtoolsStore()!;
        const listener = jest.fn();

        store.subscribe(listener);
        bus.dispatchEvent('ping');

        expect(listener).toHaveBeenCalled();
    });

    it('should reuse a shell created by the module loader', () => {
        // оболочку создаёт тот, кто пришёл первым; неймспейсы независимы
        globalWithDevtools[DEVTOOLS_GLOBAL_KEY] = { version: 1 };

        const bus = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'app' });

        bus.dispatchEvent('ping');

        expect(
            globalWithDevtools[DEVTOOLS_GLOBAL_KEY]?.[DEVTOOLS_EVENT_BUS_NAMESPACE],
        ).toBeDefined();
    });

    it('should not touch a shell of an unknown version', () => {
        globalWithDevtools[DEVTOOLS_GLOBAL_KEY] = { version: 99 };

        const bus = new EventBus({ targetNode: new EventTarget(), devtoolsKey: 'app' });

        expect(() => bus.dispatchEvent('ping')).not.toThrow();
        expect(
            globalWithDevtools[DEVTOOLS_GLOBAL_KEY]?.[DEVTOOLS_EVENT_BUS_NAMESPACE],
        ).toBeUndefined();
    });

    it('should never break dispatching when the store is broken', () => {
        globalWithDevtools[DEVTOOLS_GLOBAL_KEY] = {
            version: 1,
            [DEVTOOLS_EVENT_BUS_NAMESPACE]: {
                version: 1,
                getSnapshot: () => {
                    throw new Error('стор сломан');
                },
                subscribe: () => () => undefined,
                // @ts-expect-error намеренно сломанный writer
                writer: {
                    addEvent: () => {
                        throw new Error('стор сломан');
                    },
                    addListener: () => undefined,
                    removeListener: () => undefined,
                },
            },
        };

        const target = new EventTarget();
        const bus = new EventBus({ targetNode: target, devtoolsKey: 'app' });
        const handler = jest.fn();

        target.addEventListener('ping', handler);

        expect(() => bus.dispatchEvent('ping')).not.toThrow();
        expect(handler).toHaveBeenCalled();
    });
});

describe('serializePayload', () => {
    it('should pass primitives through', () => {
        expect(serializePayload('текст')).toEqual({ value: 'текст', omitted: false });
        expect(serializePayload(42)).toEqual({ value: 42, omitted: false });
        expect(serializePayload(undefined)).toEqual({ value: undefined, omitted: false });
    });

    it('should copy plain data', () => {
        expect(serializePayload({ id: 1, tags: ['a'] })).toEqual({
            value: { id: 1, tags: ['a'] },
            omitted: false,
        });
    });

    it('should describe a function instead of carrying it', () => {
        // функция в снимке уронила бы весь ответ структурного клона
        expect(serializePayload(() => undefined)).toEqual({ value: '[function]', omitted: true });
    });

    it('should survive a circular structure', () => {
        const payload: Record<string, unknown> = { name: 'loop' };

        payload.self = payload;

        const result = serializePayload(payload);

        expect(result.omitted).toBe(true);
        expect(typeof result.value).toBe('string');
    });

    it('should cut a payload that is too long to read anyway', () => {
        const result = serializePayload({ text: 'x'.repeat(20000) });

        expect(result.omitted).toBe(true);
        expect(String(result.value)).toContain('обрезано');
    });

    it('should stay serializable whatever it was given', () => {
        const payload = {
            node: typeof document === 'undefined' ? {} : document.createElement('div'),
        };

        expect(() => JSON.stringify(serializePayload(payload).value)).not.toThrow();
    });
});
