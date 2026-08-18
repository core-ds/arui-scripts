import { STORE_POLL_INTERVAL } from '../constants';
import { type ChromeApi, type EvalExceptionInfo } from '../extension/chrome-api';
import { SNAPSHOT_EXPRESSION } from '../extension/snapshot-expression';
import { createExtensionSource } from '../extension/source';
import { type DevtoolsSnapshot, type DevtoolsState } from '../types';

function createSnapshot(loadsCount: number): DevtoolsSnapshot {
    return {
        version: 1,
        shareScopes: [],
        sharedRequirements: {},
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

/** заглушка того куска API расширений, которым пользуется источник */
function createChrome() {
    const navigatedListeners = new Set<() => void>();
    let answer: { result: unknown; exception?: EvalExceptionInfo } = {
        result: { status: 'waiting' },
    };
    let evalCalls = 0;

    const api: ChromeApi = {
        devtools: {
            inspectedWindow: {
                eval(expression, callback) {
                    evalCalls += 1;
                    expect(expression).toBe(SNAPSHOT_EXPRESSION);
                    callback(answer.result, answer.exception);
                },
            },
            network: {
                onNavigated: {
                    addListener: (listener) => navigatedListeners.add(listener),
                    removeListener: (listener) => navigatedListeners.delete(listener),
                },
            },
        },
    };

    return {
        api,
        get evalCalls() {
            return evalCalls;
        },
        get navigatedListenersCount() {
            return navigatedListeners.size;
        },
        answerWith(result: unknown, exception?: EvalExceptionInfo) {
            answer = { result, exception };
        },
        navigate() {
            navigatedListeners.forEach((listener) => listener());
        },
    };
}

/** видимость вкладки панели: в тестах ею управляем руками */
function createVisibility(initial = true) {
    const listeners = new Set<(visible: boolean) => void>();
    let visible = initial;

    return {
        api: {
            isVisible: () => visible,
            subscribe(listener: (next: boolean) => void) {
                listeners.add(listener);

                return () => listeners.delete(listener);
            },
        },
        set(next: boolean) {
            visible = next;
            listeners.forEach((listener) => listener(next));
        },
        get listenersCount() {
            return listeners.size;
        },
    };
}

/** ответ страницы: оба неймспейса разом - ровно то, что возвращает выражение */
function answer(modules: unknown, eventBus: unknown = { status: 'waiting' }, page?: unknown) {
    return { modules, eventBus, page };
}

const WAITING: DevtoolsState = { modules: { status: 'waiting' }, eventBus: { status: 'waiting' } };

describe('createExtensionSource', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should start from waiting: the page has not answered yet', () => {
        expect(createExtensionSource(createChrome().api).getInitialState()).toEqual(WAITING);
    });

    it('should ask the page right away, not only by timer', () => {
        const chrome = createChrome();
        const states: DevtoolsState[] = [];

        chrome.answerWith(answer({ status: 'ready', snapshot: createSnapshot(1) }));
        createExtensionSource(chrome.api).subscribe((state) => states.push(state));

        expect(chrome.evalCalls).toBe(1);
        expect(states[0].modules).toEqual({ status: 'ready', snapshot: createSnapshot(1) });
    });

    it('should keep asking the page while subscribed', () => {
        const chrome = createChrome();

        createExtensionSource(chrome.api).subscribe(() => undefined);
        jest.advanceTimersByTime(STORE_POLL_INTERVAL * 3);

        expect(chrome.evalCalls).toBe(4);
    });

    it('should stay silent while the answer does not change', () => {
        // страница отвечает дважды в секунду, и почти всегда - тем же самым: перерисовывать
        // на это панель значит дёргать её на ровном месте
        const chrome = createChrome();
        const listener = jest.fn();

        chrome.answerWith(answer({ status: 'ready', snapshot: createSnapshot(1) }));
        createExtensionSource(chrome.api).subscribe(listener);
        jest.advanceTimersByTime(STORE_POLL_INTERVAL * 3);

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should notify when the answer changes', () => {
        const chrome = createChrome();
        const listener = jest.fn();

        chrome.answerWith(answer({ status: 'ready', snapshot: createSnapshot(1) }));
        createExtensionSource(chrome.api).subscribe(listener);

        chrome.answerWith(answer({ status: 'ready', snapshot: createSnapshot(2) }));
        jest.advanceTimersByTime(STORE_POLL_INTERVAL);

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenLastCalledWith({
            modules: { status: 'ready', snapshot: createSnapshot(2) },
            eventBus: { status: 'waiting' },
        });
    });

    it('should pass the unsupported verdict through', () => {
        const chrome = createChrome();
        const listener = jest.fn();

        chrome.answerWith(answer({ status: 'unsupported', found: 5, supported: 1 }));
        createExtensionSource(chrome.api).subscribe(listener);

        expect(listener).toHaveBeenCalledWith({
            modules: { status: 'unsupported', found: 5, supported: 1 },
            eventBus: { status: 'waiting' },
        });
    });

    it('should wait when the page throws on eval', () => {
        // страница ещё грузится или это вообще не наше приложение
        const chrome = createChrome();
        const listener = jest.fn();

        chrome.answerWith(undefined, { isError: true, description: 'no window' });
        createExtensionSource(chrome.api).subscribe(listener);

        expect(listener).toHaveBeenCalledWith(WAITING);
    });

    it('should wait when the page answers with nonsense', () => {
        const chrome = createChrome();
        const listener = jest.fn();

        chrome.answerWith('и что мне с этим делать');
        createExtensionSource(chrome.api).subscribe(listener);

        expect(listener).toHaveBeenCalledWith(WAITING);
    });

    it('should re-ask after a navigation even when the answer looks the same', () => {
        const chrome = createChrome();
        const listener = jest.fn();

        chrome.answerWith(answer({ status: 'waiting' }));
        createExtensionSource(chrome.api).subscribe(listener);

        expect(listener).toHaveBeenCalledTimes(1);

        // после перехода стор в странице новый, и панель обязана начать с чистого листа
        chrome.navigate();

        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('should stop polling and listening after unsubscribe', () => {
        const chrome = createChrome();
        const listener = jest.fn();

        const unsubscribe = createExtensionSource(chrome.api).subscribe(listener);
        const callsBefore = chrome.evalCalls;

        unsubscribe();
        jest.advanceTimersByTime(STORE_POLL_INTERVAL * 3);

        expect(chrome.evalCalls).toBe(callsBefore);
        expect(chrome.navigatedListenersCount).toBe(0);
    });

    it('should not notify with an answer that arrives after unsubscribe', () => {
        let deferred: ((result: unknown) => void) | undefined;
        const api: ChromeApi = {
            devtools: {
                inspectedWindow: {
                    eval(_expression, callback) {
                        deferred = callback;
                    },
                },
            },
        };
        const listener = jest.fn();

        const unsubscribe = createExtensionSource(api).subscribe(listener);

        unsubscribe();
        deferred?.(answer({ status: 'ready', snapshot: createSnapshot(1) }));

        expect(listener).not.toHaveBeenCalled();
    });

    it('should carry both namespaces of the contract', () => {
        // неймспейсы независимы: шину наполняет другой пакет, и любого из них может не быть
        const chrome = createChrome();
        const listener = jest.fn();

        chrome.answerWith(
            answer(
                { status: 'waiting' },
                { status: 'ready', snapshot: { version: 1, events: [], listeners: [] } },
            ),
        );
        createExtensionSource(chrome.api).subscribe(listener);

        expect(listener).toHaveBeenCalledWith({
            modules: { status: 'waiting' },
            eventBus: { status: 'ready', snapshot: { version: 1, events: [], listeners: [] } },
        });
    });

    it('should degrade outside of an extension', () => {
        // пакет собирается и в страницу тоже - код источника не должен падать без chrome
        const listener = jest.fn();

        expect(() => createExtensionSource(undefined).subscribe(listener)).not.toThrow();
        expect(listener).toHaveBeenCalledWith(WAITING);
    });

    it('should survive an extension without the navigation API', () => {
        const api: ChromeApi = {
            devtools: { inspectedWindow: { eval: (_expression, callback) => callback(undefined) } },
        };

        expect(() => createExtensionSource(api).subscribe(() => undefined)).not.toThrow();
    });

    it('should carry the page clock through', () => {
        // без начала отсчёта страницы панель не отличит записи прошлой загрузки от текущих:
        // её собственный `performance` считает время от открытия DevTools
        const chrome = createChrome();
        const states: DevtoolsState[] = [];

        chrome.answerWith(answer({ status: 'waiting' }, { status: 'waiting' }, { timeOrigin: 42 }));
        createExtensionSource(chrome.api).subscribe((state) => states.push(state));

        expect(states[0].page).toEqual({ timeOrigin: 42 });
    });

    it('should ignore a page clock that is not a number', () => {
        const chrome = createChrome();
        const states: DevtoolsState[] = [];

        chrome.answerWith(
            answer({ status: 'waiting' }, { status: 'waiting' }, { timeOrigin: 'давно' }),
        );
        createExtensionSource(chrome.api).subscribe((state) => states.push(state));

        expect(states[0].page).toBeUndefined();
    });

    it('should not ask the page while the panel is hidden', () => {
        // `eval` в чужой документ дважды в секунду ради данных, на которые никто
        // не смотрит, - работа вхолостую
        const chrome = createChrome();
        const visibility = createVisibility(false);

        createExtensionSource(chrome.api, visibility.api).subscribe(() => undefined);
        jest.advanceTimersByTime(STORE_POLL_INTERVAL * 4);

        expect(chrome.evalCalls).toBe(0);
    });

    it('should ask right away when the panel comes back', () => {
        const chrome = createChrome();
        const visibility = createVisibility(false);

        createExtensionSource(chrome.api, visibility.api).subscribe(() => undefined);
        visibility.set(true);

        // пока вкладку не смотрели, страница успела прожить свою жизнь: ждать тик незачем
        expect(chrome.evalCalls).toBe(1);

        jest.advanceTimersByTime(STORE_POLL_INTERVAL);

        expect(chrome.evalCalls).toBe(2);
    });

    it('should stop the polling when the panel is hidden', () => {
        const chrome = createChrome();
        const visibility = createVisibility();

        createExtensionSource(chrome.api, visibility.api).subscribe(() => undefined);
        jest.advanceTimersByTime(STORE_POLL_INTERVAL);

        const asked = chrome.evalCalls;

        visibility.set(false);
        jest.advanceTimersByTime(STORE_POLL_INTERVAL * 4);

        expect(chrome.evalCalls).toBe(asked);
    });

    it('should not ask on navigation while the panel is hidden', () => {
        const chrome = createChrome();
        const visibility = createVisibility(false);

        createExtensionSource(chrome.api, visibility.api).subscribe(() => undefined);
        chrome.navigate();

        expect(chrome.evalCalls).toBe(0);
    });

    it('should let go of the visibility on unsubscribe', () => {
        const chrome = createChrome();
        const visibility = createVisibility();

        const unsubscribe = createExtensionSource(chrome.api, visibility.api).subscribe(
            () => undefined,
        );

        expect(visibility.listenersCount).toBe(1);

        unsubscribe();

        expect(visibility.listenersCount).toBe(0);
    });
});
