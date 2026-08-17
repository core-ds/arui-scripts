import {
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    STORE_POLL_INTERVAL,
    SUPPORTED_DEVTOOLS_VERSION,
    SUPPORTED_MODULES_VERSION,
} from './constants';
import {
    type AruiDevtools,
    type AruiModulesDevtools,
    type GlobalWithDevtools,
    type ModulesStoreState,
} from './types';

function readGlobal(): AruiDevtools | undefined {
    if (typeof globalThis === 'undefined') {
        return undefined;
    }

    return (globalThis as GlobalWithDevtools)[DEVTOOLS_GLOBAL_KEY];
}

function isReadableStore(store: AruiModulesDevtools): boolean {
    return typeof store.getSnapshot === 'function' && typeof store.subscribe === 'function';
}

/**
 * Читает стор неймспейса `modules` из глобала.
 * Возвращает `undefined` во всех случаях, когда читать нечего или небезопасно -
 * различить эти случаи можно через {@link readStoreState}.
 */
export function readModulesStore(): AruiModulesDevtools | undefined {
    const root = readGlobal();

    if (!root || root.version !== SUPPORTED_DEVTOOLS_VERSION) {
        return undefined;
    }

    const store = root[DEVTOOLS_MODULES_NAMESPACE];

    if (!store || store.version !== SUPPORTED_MODULES_VERSION || !isReadableStore(store)) {
        return undefined;
    }

    return store;
}

/**
 * Текущее состояние стора вместе с причиной, по которой данных нет.
 * Панель показывает эту причину пользователю: «нет стора» и «стор от несовместимой версии» -
 * это разные проблемы с разными действиями.
 */
export function readStoreState(): ModulesStoreState {
    const root = readGlobal();

    if (root && root.version !== SUPPORTED_DEVTOOLS_VERSION) {
        return {
            status: 'unsupported',
            found: root.version,
            supported: SUPPORTED_DEVTOOLS_VERSION,
        };
    }

    const store = root?.[DEVTOOLS_MODULES_NAMESPACE];

    if (store && store.version !== SUPPORTED_MODULES_VERSION) {
        return {
            status: 'unsupported',
            found: store.version,
            supported: SUPPORTED_MODULES_VERSION,
        };
    }

    const readable = readModulesStore();

    if (!readable) {
        return { status: 'waiting' };
    }

    return { status: 'ready', snapshot: readable.getSnapshot() };
}

/**
 * Подписывается на стор и зовёт `listener` при каждом изменении, начиная с текущего состояния.
 *
 * Пока стора нет, состояние `waiting` и мы опрашиваем глобал по таймеру: подписаться заранее
 * не на что. Как только стор появился, таймер выключается и дальше работает штатная подписка.
 *
 * @returns функция отписки, снимающая и подписку, и таймер
 */
export function watchModulesStore(listener: (state: ModulesStoreState) => void): () => void {
    let stopped = false;
    let unsubscribeFromStore: (() => void) | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    function stopPolling() {
        if (pollTimer !== undefined) {
            clearInterval(pollTimer);
            pollTimer = undefined;
        }
    }

    function emit() {
        if (stopped) {
            return;
        }

        try {
            listener(readStoreState());
        } catch (error) {
            // Панель не должна ронять приложение, в которое её инжектнули, и не должна
            // ломаться сама: первый же emit происходит внутри watchModulesStore, до того как
            // тот вернёт функцию отписки, - бросок отсюда оставил бы висеть и подписку,
            // и наполовину смонтированную панель. Пропускаем кадр и живём дальше.
            // eslint-disable-next-line no-console
            console.error('[arui devtools] не удалось отрисовать панель', error);
        }
    }

    function tryAttach() {
        if (stopped || unsubscribeFromStore) {
            return;
        }

        const store = readModulesStore();

        if (!store) {
            return;
        }

        stopPolling();
        unsubscribeFromStore = store.subscribe(emit);
        emit();
    }

    /**
     * Один тик опроса. Стор может появиться не только совместимым: если у него незнакомая
     * версия, подключаться не к чему и ждать дальше нечего - но пользователю нужно сказать
     * про версию, а не молча показывать «ждём модули» под вечный таймер.
     */
    function poll() {
        tryAttach();

        if (stopped || unsubscribeFromStore) {
            return;
        }

        if (readStoreState().status === 'unsupported') {
            stopPolling();
            emit();
        }
    }

    tryAttach();

    if (!unsubscribeFromStore) {
        const initialState = readStoreState();

        listener(initialState);

        // стор несовместимой версии сам собой совместимым не станет, ждать нечего
        if (initialState.status === 'waiting') {
            pollTimer = setInterval(poll, STORE_POLL_INTERVAL);
        }
    }

    return () => {
        stopped = true;
        stopPolling();
        unsubscribeFromStore?.();
        unsubscribeFromStore = undefined;
    };
}
