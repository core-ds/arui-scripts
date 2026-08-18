import { announceStoreCreated } from './announce';
import { isCollectingEnabled } from './enabled';
import { readSharedRequirements, readShareScopes } from './share-scope';
import { EVENTS_LIMIT, LOADS_LIMIT, persistSnapshot, restoreSnapshot } from './snapshot-storage';
import {
    type AruiDevtools,
    type AruiModulesDevtools,
    type DevtoolsEvent,
    type DevtoolsSharedRequirement,
    type DevtoolsShareScope,
    type DevtoolsSnapshot,
    type ModuleLoadRecord,
} from './types';

/** ключ в globalThis, по которому лежит оболочка devtools */
export const DEVTOOLS_GLOBAL_KEY = '__ARUI_DEVTOOLS__';
/** имя неймспейса загрузчика модулей внутри оболочки */
export const DEVTOOLS_MODULES_NAMESPACE = 'modules';
/** версия оболочки */
export const DEVTOOLS_VERSION = 1;
/** версия контракта неймспейса modules */
export const DEVTOOLS_MODULES_VERSION = 1;

/** под этим именем в контракте лежат требования самого приложения-хоста */
export const HOST_REQUIREMENTS_SOURCE = 'приложение';

export { DEVTOOLS_STORAGE_KEY, EVENTS_LIMIT, LOADS_LIMIT } from './snapshot-storage';

/**
 * Внутреннее API записи. Не является частью публичного контракта и может меняться
 * в пределах одной версии стора, поэтому лежит под отдельным ключом.
 * Загрузчик ходит сюда только через `report.ts`.
 */
export type DevtoolsWriter = {
    nextLoadId(): string;
    addLoad(record: ModuleLoadRecord): void;
    getLoad(loadId: string): ModuleLoadRecord | undefined;
    updateLoad(loadId: string, updater: (record: ModuleLoadRecord) => ModuleLoadRecord): void;
    addEvent(event: Omit<DevtoolsEvent, 'id'>): void;
    refreshShareScopes(): void;
    addSharedRequirements(requirements: Record<string, DevtoolsSharedRequirement[]>): void;
};

export type DevtoolsModulesStore = AruiModulesDevtools & {
    /** @internal */
    writer: DevtoolsWriter;
};

type GlobalWithDevtools = typeof globalThis & {
    [DEVTOOLS_GLOBAL_KEY]?: AruiDevtools;
};

function getGlobal(): GlobalWithDevtools | undefined {
    return typeof globalThis === 'undefined' ? undefined : (globalThis as GlobalWithDevtools);
}

function createModulesStore(): DevtoolsModulesStore {
    const restored = restoreSnapshot(DEVTOOLS_MODULES_VERSION);

    let { loads } = restored;
    let { events } = restored;
    // на старте скоуп ещё пуст: его наполняет первая же загрузка модуля. Восстановленный
    // из sessionStorage снимок сюда не тащим - он относится к прошлой странице
    let shareScopes: DevtoolsShareScope[] = [];
    // Свои требования подставлены на сборке и не меняются - читаем один раз. Требования
    // провайдеров добавляются позже: они приезжают в манифестах, когда те скачиваются.
    // `hostAppId` тут неоткуда взять, поэтому автор своих требований - само приложение
    let sharedRequirements: Record<string, DevtoolsSharedRequirement[]> =
        readSharedRequirements(HOST_REQUIREMENTS_SOURCE);
    let snapshot: DevtoolsSnapshot = {
        version: DEVTOOLS_MODULES_VERSION,
        loads,
        events,
        shareScopes,
        sharedRequirements,
    };

    const listeners = new Set<() => void>();

    // префикс нужен, чтобы loadId не столкнулись с восстановленными из sessionStorage
    // записями предыдущей загрузки страницы
    const pagePrefix = Math.random().toString(36).slice(2, 8);
    let loadCounter = 0;
    let eventCounter = events[events.length - 1]?.id ?? 0;

    let persistScheduled = false;

    /**
     * Немедленно дописывает запланированный снимок. Кроме таймера его зовёт уход со страницы:
     * отложенная запись могла не успеть, а хвост перед самой навигацией - ровно те записи,
     * ради которых снимок и дублируется в sessionStorage.
     */
    function flushPersist() {
        if (!persistScheduled) {
            return;
        }

        persistScheduled = false;
        persistSnapshot(snapshot);
    }

    function schedulePersist() {
        if (persistScheduled) {
            return;
        }

        persistScheduled = true;
        setTimeout(flushPersist, 0);
    }

    function commit() {
        snapshot = {
            version: DEVTOOLS_MODULES_VERSION,
            loads,
            events,
            shareScopes,
            sharedRequirements,
        };

        listeners.forEach((listener) => {
            try {
                listener();
            } catch {
                // подписчик не должен ломать ни другие подписки, ни загрузку модуля
            }
        });

        schedulePersist();
    }

    try {
        // pagehide стреляет и перед выгрузкой страницы, и перед уходом в bfcache
        if (typeof window !== 'undefined') {
            window.addEventListener('pagehide', flushPersist);
        }
    } catch {
        // не смогли подписаться - живём на одном таймере, как раньше
    }

    const writer: DevtoolsWriter = {
        nextLoadId() {
            loadCounter += 1;

            return `${pagePrefix}-${loadCounter}`;
        },

        addLoad(record) {
            loads = loads.concat(record).slice(-LOADS_LIMIT);
            commit();
        },

        getLoad(loadId) {
            return loads.find((record) => record.loadId === loadId);
        },

        updateLoad(loadId, updater) {
            const index = loads.findIndex((record) => record.loadId === loadId);

            // запись могла быть вытеснена из кольцевого буфера — это не ошибка
            if (index === -1) {
                return;
            }

            const next = loads.slice();

            next[index] = updater(loads[index]);
            loads = next;
            commit();
        },

        addEvent(event) {
            eventCounter += 1;
            events = events.concat({ ...event, id: eventCounter }).slice(-EVENTS_LIMIT);
            commit();
        },

        refreshShareScopes() {
            shareScopes = readShareScopes();
            commit();
        },

        addSharedRequirements(requirements) {
            let changed = false;
            const next = { ...sharedRequirements };

            Object.keys(requirements).forEach((name) => {
                requirements[name].forEach((requirement) => {
                    const existing = next[name] ?? [];

                    // один провайдер объявляет пакет один раз, а манифест скачивается
                    // на каждую загрузку - дубли тут были бы только шумом
                    if (existing.some((item) => item.from === requirement.from)) {
                        return;
                    }

                    next[name] = existing.concat(requirement);
                    changed = true;
                });
            });

            if (changed) {
                sharedRequirements = next;
                commit();
            }
        },
    };

    return {
        version: DEVTOOLS_MODULES_VERSION,
        getSnapshot() {
            return snapshot;
        },
        subscribe(listener) {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },
        writer,
    };
}

/**
 * Внутренний writer имеет право меняться в пределах версии стора, поэтому чужая копия пакета
 * проверяет каждый метод, который зовут репортёры: стор с совпавшей версией, но другим writer,
 * молча принял бы часть записей и потерял остальные.
 */
function isCompatibleStore(store: AruiModulesDevtools | undefined): store is DevtoolsModulesStore {
    const writer = (store as DevtoolsModulesStore | undefined)?.writer;

    return Boolean(
        store &&
            store.version === DEVTOOLS_MODULES_VERSION &&
            typeof writer?.nextLoadId === 'function' &&
            typeof writer?.addLoad === 'function' &&
            typeof writer?.getLoad === 'function' &&
            typeof writer?.updateLoad === 'function' &&
            typeof writer?.addEvent === 'function' &&
            typeof writer?.refreshShareScopes === 'function' &&
            typeof writer?.addSharedRequirements === 'function',
    );
}

/**
 * Возвращает оболочку devtools из глобального объекта, создавая её при первом обращении.
 * Если в глобале лежит оболочка несовместимой версии — не трогаем её и возвращаем undefined.
 */
function getDevtoolsRoot(): AruiDevtools | undefined {
    const globalObject = getGlobal();

    if (!globalObject) {
        return undefined;
    }

    const existing = globalObject[DEVTOOLS_GLOBAL_KEY];

    if (existing) {
        return existing.version === DEVTOOLS_VERSION ? existing : undefined;
    }

    const root: AruiDevtools = { version: DEVTOOLS_VERSION };

    globalObject[DEVTOOLS_GLOBAL_KEY] = root;

    return root;
}

/**
 * Возвращает стор неймспейса `modules`, создавая его при первом обращении.
 *
 * Если сбор диагностики выключен (прод-сборка без флага), возвращает undefined и ничего
 * не создаёт: ни глобала, ни записи в sessionStorage. Все репортёры на этом и затухают.
 *
 * На странице может оказаться несколько копий пакета — тогда все они пишут в один стор.
 * Если в глобале лежит стор несовместимой версии (его положила другая копия пакета),
 * мы туда не лезем и возвращаем undefined: писать в чужой контракт опаснее, чем не писать вовсе.
 */
export function getDevtoolsModulesStore(): DevtoolsModulesStore | undefined {
    if (!isCollectingEnabled()) {
        return undefined;
    }

    const root = getDevtoolsRoot();

    if (!root) {
        return undefined;
    }

    const existing = root[DEVTOOLS_MODULES_NAMESPACE];

    if (existing) {
        return isCompatibleStore(existing) ? existing : undefined;
    }

    const store = createModulesStore();

    root[DEVTOOLS_MODULES_NAMESPACE] = store;

    announceStoreCreated();

    return store;
}
