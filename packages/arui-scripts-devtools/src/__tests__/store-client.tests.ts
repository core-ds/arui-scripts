import { DEVTOOLS_GLOBAL_KEY, STORE_POLL_INTERVAL } from '../constants';
import { readModulesStore, readStoreState, watchModulesStore } from '../store-client';
import { type AruiDevtools, type DevtoolsSnapshot, type ModulesStoreState } from '../types';

type GlobalWithDevtools = typeof globalThis & { [DEVTOOLS_GLOBAL_KEY]?: AruiDevtools };

const globalWithDevtools = globalThis as GlobalWithDevtools;

function createSnapshot(loadsCount: number): DevtoolsSnapshot {
    return {
        version: 1,
        loads: Array.from({ length: loadsCount }, (_, index) => ({
            loadId: `load-${index}`,
            moduleId: `module-${index}`,
            hostAppId: 'host',
            status: 'loaded' as const,
            shareScope: 'default',
            fromCache: false,
            scripts: [],
            styles: [],
            timings: {},
            startedAt: 0,
        })),
        events: [],
    };
}

function createFakeStore(version = 1) {
    const listeners = new Set<() => void>();
    let snapshot = createSnapshot(1);

    return {
        version,
        getSnapshot: () => snapshot,
        subscribe(listener: () => void) {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },
        emit(next: DevtoolsSnapshot) {
            snapshot = next;
            listeners.forEach((listener) => listener());
        },
        get listenersCount() {
            return listeners.size;
        },
    };
}

function putStore(store: unknown, rootVersion = 1) {
    globalWithDevtools[DEVTOOLS_GLOBAL_KEY] = {
        version: rootVersion,
        modules: store,
    } as AruiDevtools;
}

describe('store-client', () => {
    beforeEach(() => {
        delete globalWithDevtools[DEVTOOLS_GLOBAL_KEY];
    });

    describe('readModulesStore', () => {
        it('should return undefined if there is no global', () => {
            expect(readModulesStore()).toBeUndefined();
        });

        it('should return undefined if root version is not supported', () => {
            putStore(createFakeStore(), 2);

            expect(readModulesStore()).toBeUndefined();
        });

        it('should return undefined if namespace version is not supported', () => {
            putStore(createFakeStore(2));

            expect(readModulesStore()).toBeUndefined();
        });

        it('should return undefined if store does not look like a store', () => {
            putStore({ version: 1 });

            expect(readModulesStore()).toBeUndefined();
        });

        it('should return the store', () => {
            const store = createFakeStore();

            putStore(store);

            expect(readModulesStore()).toBe(store);
        });
    });

    describe('readStoreState', () => {
        it('should wait when there is no store at all', () => {
            expect(readStoreState()).toEqual({ status: 'waiting' });
        });

        it('should wait when the loader is there but no module was loaded yet', () => {
            globalWithDevtools[DEVTOOLS_GLOBAL_KEY] = { version: 1 };

            expect(readStoreState()).toEqual({ status: 'waiting' });
        });

        it('should report unsupported root version', () => {
            putStore(createFakeStore(), 42);

            expect(readStoreState()).toEqual({ status: 'unsupported', found: 42, supported: 1 });
        });

        it('should report unsupported namespace version', () => {
            putStore(createFakeStore(7));

            expect(readStoreState()).toEqual({ status: 'unsupported', found: 7, supported: 1 });
        });

        it('should return the snapshot', () => {
            const store = createFakeStore();

            putStore(store);

            expect(readStoreState()).toEqual({ status: 'ready', snapshot: store.getSnapshot() });
        });
    });

    describe('watchModulesStore', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should notify with the current state right away', () => {
            const store = createFakeStore();

            putStore(store);

            const listener = jest.fn();

            watchModulesStore(listener);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith({
                status: 'ready',
                snapshot: store.getSnapshot(),
            });
        });

        it('should notify on store updates', () => {
            const store = createFakeStore();

            putStore(store);

            const states: ModulesStoreState[] = [];

            watchModulesStore((state) => states.push(state));

            const next = createSnapshot(3);

            store.emit(next);

            expect(states).toHaveLength(2);
            expect(states[1]).toEqual({ status: 'ready', snapshot: next });
        });

        it('should wait for a store that appears later', () => {
            const listener = jest.fn();

            watchModulesStore(listener);

            expect(listener).toHaveBeenCalledWith({ status: 'waiting' });

            const store = createFakeStore();

            putStore(store);
            jest.advanceTimersByTime(STORE_POLL_INTERVAL);

            expect(listener).toHaveBeenLastCalledWith({
                status: 'ready',
                snapshot: store.getSnapshot(),
            });
            expect(store.listenersCount).toBe(1);
        });

        it('should not poll for a store of an unsupported version', () => {
            const store = createFakeStore(7);

            putStore(store);

            const listener = jest.fn();

            watchModulesStore(listener);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(jest.getTimerCount()).toBe(0);
        });

        it('should report a store of an unsupported version that appears while polling', () => {
            const listener = jest.fn();

            watchModulesStore(listener);

            expect(listener).toHaveBeenCalledWith({ status: 'waiting' });

            putStore(createFakeStore(7));
            jest.advanceTimersByTime(STORE_POLL_INTERVAL);

            expect(listener).toHaveBeenLastCalledWith({
                status: 'unsupported',
                found: 7,
                supported: 1,
            });
            // несовместимая версия сама собой совместимой не станет - опрос должен остановиться
            expect(jest.getTimerCount()).toBe(0);
        });

        it('should stop notifying after unsubscribe', () => {
            const store = createFakeStore();

            putStore(store);

            const listener = jest.fn();
            const stop = watchModulesStore(listener);

            stop();
            store.emit(createSnapshot(5));

            expect(listener).toHaveBeenCalledTimes(1);
            expect(store.listenersCount).toBe(0);
        });

        it('should stop polling after unsubscribe', () => {
            const listener = jest.fn();
            const stop = watchModulesStore(listener);

            stop();

            const store = createFakeStore();

            putStore(store);
            jest.advanceTimersByTime(STORE_POLL_INTERVAL * 4);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(store.listenersCount).toBe(0);
        });
    });
});
