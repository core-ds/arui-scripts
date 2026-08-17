import {
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    DEVTOOLS_MODULES_VERSION,
    DEVTOOLS_STORAGE_KEY,
    DEVTOOLS_VERSION,
    type DevtoolsModulesStore,
    EVENTS_LIMIT,
    getDevtoolsModulesStore,
    LOADS_LIMIT,
} from '../store';
import { type AruiDevtools, type ModuleLoadRecord } from '../types';

type GlobalWithScopes = typeof globalThis & { __webpack_share_scopes__?: unknown };

function resetGlobal() {
    delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
    delete (globalThis as GlobalWithScopes).__webpack_share_scopes__;
    sessionStorage.clear();
}

function getRoot(): AruiDevtools | undefined {
    return (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY] as AruiDevtools | undefined;
}

function setRoot(root: unknown) {
    (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY] = root;
}

function createRecord(loadId: string): ModuleLoadRecord {
    return {
        loadId,
        moduleId: `module-${loadId}`,
        hostAppId: 'host',
        shareScope: 'default',
        status: 'pending',
        fromCache: false,
        scripts: [],
        styles: [],
        timings: {},
        startedAt: Date.now(),
    };
}

/** persist запланирован через setTimeout(0), даём ему выполниться */
function flushPersist() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

function getStore(): DevtoolsModulesStore {
    const store = getDevtoolsModulesStore();

    if (!store) {
        throw new Error('store is expected to be created');
    }

    return store;
}

describe('devtools store', () => {
    beforeEach(resetGlobal);
    afterEach(resetGlobal);

    it('should create root and modules namespace on first access and reuse them after', () => {
        const store = getStore();

        expect(getRoot()?.version).toBe(DEVTOOLS_VERSION);
        expect(store.version).toBe(DEVTOOLS_MODULES_VERSION);
        expect(getRoot()?.[DEVTOOLS_MODULES_NAMESPACE]).toBe(store);
        expect(getDevtoolsModulesStore()).toBe(store);
    });

    it('should reuse root created by another copy of the package', () => {
        const root = { version: DEVTOOLS_VERSION };

        setRoot(root);

        const store = getStore();

        expect(getRoot()).toBe(root);
        expect(getRoot()?.[DEVTOOLS_MODULES_NAMESPACE]).toBe(store);
    });

    it('should not touch root of unknown version', () => {
        setRoot({ version: 42 });

        expect(getDevtoolsModulesStore()).toBeUndefined();
        expect(getRoot()?.[DEVTOOLS_MODULES_NAMESPACE]).toBeUndefined();
    });

    it('should return undefined when namespace has unknown version', () => {
        setRoot({
            version: DEVTOOLS_VERSION,
            [DEVTOOLS_MODULES_NAMESPACE]: {
                version: 42,
                getSnapshot: () => ({}),
                subscribe: () => () => undefined,
            },
        });

        expect(getDevtoolsModulesStore()).toBeUndefined();
    });

    it('should return undefined when namespace has no writer', () => {
        setRoot({
            version: DEVTOOLS_VERSION,
            [DEVTOOLS_MODULES_NAMESPACE]: {
                version: DEVTOOLS_MODULES_VERSION,
                getSnapshot: () => ({}),
                subscribe: () => () => undefined,
            },
        });

        expect(getDevtoolsModulesStore()).toBeUndefined();
    });

    it('should return undefined when writer misses some of the methods', () => {
        // writer имеет право меняться в пределах версии стора: совпавшая версия ещё не значит,
        // что писать безопасно - часть записей дошла бы, а часть молча потерялась
        setRoot({
            version: DEVTOOLS_VERSION,
            [DEVTOOLS_MODULES_NAMESPACE]: {
                version: DEVTOOLS_MODULES_VERSION,
                getSnapshot: () => ({}),
                subscribe: () => () => undefined,
                writer: { addLoad: () => undefined },
            },
        });

        expect(getDevtoolsModulesStore()).toBeUndefined();
    });

    it('should return undefined when writer cannot refresh share scopes', () => {
        // writer старой копии пакета не умеет снимать скоуп: писать в него - терять данные
        setRoot({
            version: DEVTOOLS_VERSION,
            [DEVTOOLS_MODULES_NAMESPACE]: {
                version: DEVTOOLS_MODULES_VERSION,
                getSnapshot: () => ({}),
                subscribe: () => () => undefined,
                writer: {
                    nextLoadId: () => '1',
                    addLoad: () => undefined,
                    getLoad: () => undefined,
                    updateLoad: () => undefined,
                    addEvent: () => undefined,
                },
            },
        });

        expect(getDevtoolsModulesStore()).toBeUndefined();
    });

    it('should start with an empty share scope and fill it on refresh', () => {
        const store = getStore();

        // до первой загрузки модуля скоуп пуст, и снимок обязан быть пустым массивом,
        // а не отсутствующим полем: читателю обещан полный контракт
        expect(store.getSnapshot().shareScopes).toEqual([]);

        (globalThis as GlobalWithScopes).__webpack_share_scopes__ = {
            default: { react: { '18.3.1': { from: 'host', loaded: 1 } } },
        };
        store.writer.refreshShareScopes();

        expect(store.getSnapshot().shareScopes).toHaveLength(1);
    });

    it('should notify subscribers when the share scope changes', () => {
        const store = getStore();
        const listener = jest.fn();

        store.subscribe(listener);
        store.writer.refreshShareScopes();

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should not restore the share scope of the previous page load', async () => {
        (globalThis as GlobalWithScopes).__webpack_share_scopes__ = {
            default: { react: { '18.3.1': {} } },
        };

        const store = getStore();

        store.writer.addLoad(createRecord('1'));
        store.writer.refreshShareScopes();
        await flushPersist();

        delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
        delete (globalThis as GlobalWithScopes).__webpack_share_scopes__;

        // скоуп прошлой страницы к новой не относится: он пересоберётся с первой загрузкой
        expect(getStore().getSnapshot().shareScopes).toEqual([]);
    });

    it('should keep snapshot reference stable until data changes', () => {
        const store = getStore();
        const snapshot = store.getSnapshot();

        expect(store.getSnapshot()).toBe(snapshot);

        store.writer.addLoad(createRecord('1'));

        expect(store.getSnapshot()).not.toBe(snapshot);
    });

    it('should notify subscribers and stop after unsubscribe', () => {
        const store = getStore();
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);

        store.writer.addLoad(createRecord('1'));
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        store.writer.addLoad(createRecord('2'));
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should not break other subscribers when one of them throws', () => {
        const store = getStore();
        const good = jest.fn();

        store.subscribe(() => {
            throw new Error('broken listener');
        });
        store.subscribe(good);

        expect(() => store.writer.addLoad(createRecord('1'))).not.toThrow();
        expect(good).toHaveBeenCalledTimes(1);
    });

    it('should limit loads buffer', () => {
        const store = getStore();

        for (let i = 0; i < LOADS_LIMIT + 10; i++) {
            store.writer.addLoad(createRecord(String(i)));
        }

        const { loads } = store.getSnapshot();

        expect(loads).toHaveLength(LOADS_LIMIT);
        expect(loads[0].loadId).toBe('10');
        expect(loads[loads.length - 1].loadId).toBe(String(LOADS_LIMIT + 9));
    });

    it('should limit events buffer', () => {
        const store = getStore();

        for (let i = 0; i < EVENTS_LIMIT + 5; i++) {
            store.writer.addEvent({
                type: 'load-start',
                loadId: String(i),
                moduleId: 'module',
                timestamp: Date.now(),
                time: i,
            });
        }

        const { events } = store.getSnapshot();

        expect(events).toHaveLength(EVENTS_LIMIT);
        expect(events[events.length - 1].id).toBe(EVENTS_LIMIT + 5);
    });

    it('should generate unique load ids', () => {
        const store = getStore();
        const ids = new Set([
            store.writer.nextLoadId(),
            store.writer.nextLoadId(),
            store.writer.nextLoadId(),
        ]);

        expect(ids.size).toBe(3);
    });

    it('should ignore update of unknown load id', () => {
        const store = getStore();
        const updater = jest.fn();

        expect(() => store.writer.updateLoad('missing', updater)).not.toThrow();
        expect(updater).not.toHaveBeenCalled();
    });

    it('should replace record object on update so consumers can compare by reference', () => {
        const store = getStore();

        store.writer.addLoad(createRecord('1'));

        const before = store.getSnapshot().loads[0];

        store.writer.updateLoad('1', (record) => ({ ...record, status: 'loaded' }));

        const after = store.getSnapshot().loads[0];

        expect(after).not.toBe(before);
        expect(after.status).toBe('loaded');
        expect(before.status).toBe('pending');
    });

    it('should duplicate content to sessionStorage and restore it on next page load', async () => {
        const store = getStore();

        store.writer.addLoad(createRecord('1'));
        store.writer.addEvent({
            type: 'load-start',
            loadId: '1',
            moduleId: 'module-1',
            timestamp: Date.now(),
            time: 1,
        });

        await flushPersist();

        expect(sessionStorage.getItem(DEVTOOLS_STORAGE_KEY)).toBeTruthy();

        // эмулируем перезагрузку страницы: глобала нет, sessionStorage остался
        delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];

        const restored = getStore().getSnapshot();

        expect(restored.loads).toHaveLength(1);
        expect(restored.loads[0].loadId).toBe('1');
        expect(restored.events).toHaveLength(1);
    });

    it('should flush pending snapshot to sessionStorage on pagehide', () => {
        const store = getStore();

        store.writer.addLoad(createRecord('1'));

        // отложенная запись ещё не добежала до своего таймера
        expect(sessionStorage.getItem(DEVTOOLS_STORAGE_KEY)).toBeNull();

        window.dispatchEvent(new Event('pagehide'));

        const raw = sessionStorage.getItem(DEVTOOLS_STORAGE_KEY);

        expect(raw).toBeTruthy();
        expect(JSON.parse(raw as string).loads).toHaveLength(1);
    });

    it('should continue event ids after restore', async () => {
        const store = getStore();

        store.writer.addEvent({
            type: 'load-start',
            loadId: '1',
            moduleId: 'module-1',
            timestamp: Date.now(),
            time: 1,
        });

        await flushPersist();
        delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];

        const restoredStore = getStore();

        restoredStore.writer.addEvent({
            type: 'load-end',
            loadId: '1',
            moduleId: 'module-1',
            timestamp: Date.now(),
            time: 2,
        });

        const { events } = restoredStore.getSnapshot();

        expect(events.map((event) => event.id)).toEqual([1, 2]);
    });

    it('should ignore broken sessionStorage content', () => {
        sessionStorage.setItem(DEVTOOLS_STORAGE_KEY, 'not a json');

        expect(getStore().getSnapshot().loads).toEqual([]);
    });

    it('should ignore sessionStorage content of unknown version', () => {
        sessionStorage.setItem(
            DEVTOOLS_STORAGE_KEY,
            JSON.stringify({ version: 999, loads: [createRecord('1')], events: [] }),
        );

        expect(getStore().getSnapshot().loads).toEqual([]);
    });

    it('should survive sessionStorage write failures', async () => {
        const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });

        const store = getStore();

        expect(() => store.writer.addLoad(createRecord('1'))).not.toThrow();
        await flushPersist();
        expect(store.getSnapshot().loads).toHaveLength(1);

        setItem.mockRestore();
    });
});
