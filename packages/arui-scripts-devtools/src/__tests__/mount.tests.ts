import { act } from 'react';

import { type AruiDevtools, DEVTOOLS_GLOBAL_KEY, type DevtoolsSnapshot } from '../contract';
import { DEVTOOLS_ROOT_ID, isDevtoolsMounted, mountDevtools, unmountDevtools } from '../mount';
import { readPanelState, writePanelState } from '../panel-state';

type GlobalWithDevtools = typeof globalThis & { [DEVTOOLS_GLOBAL_KEY]?: AruiDevtools };
type GlobalWithScopes = typeof globalThis & {
    __webpack_share_scopes__?: Record<string, Record<string, Record<string, unknown>>>;
};
type GlobalWithAct = typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

const globalWithDevtools = globalThis as GlobalWithDevtools;

// внутри панели React: без этого флага его дев-сборка ругается на обновления вне act
(globalThis as GlobalWithAct).IS_REACT_ACT_ENVIRONMENT = true;

function createSnapshot(loadsCount: number, eventsCount = 0): DevtoolsSnapshot {
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
        events: Array.from({ length: eventsCount }, (_, index) => ({
            id: index,
            type: 'load-start' as const,
            loadId: `load-${index}`,
            moduleId: `module-${index}`,
            timestamp: 0,
            time: 0,
        })),
    };
}

function putStore(snapshot: DevtoolsSnapshot) {
    const listeners = new Set<() => void>();
    let current = snapshot;

    globalWithDevtools[DEVTOOLS_GLOBAL_KEY] = {
        version: 1,
        modules: {
            version: 1,
            getSnapshot: () => current,
            subscribe(listener: () => void) {
                listeners.add(listener);

                return () => {
                    listeners.delete(listener);
                };
            },
        },
    };

    return {
        emit(next: DevtoolsSnapshot) {
            current = next;
            act(() => {
                listeners.forEach((listener) => listener());
            });
        },
        get listenersCount() {
            return listeners.size;
        },
    };
}

/** mountDevtools рендерит React-дерево - в тестах вызов обязан жить внутри act */
function mountPanel(options?: Parameters<typeof mountDevtools>[0]) {
    let unmount: () => void = () => undefined;

    act(() => {
        unmount = mountDevtools(options);
    });

    return unmount;
}

/** клик по элементу панели будит React-обработчики - тоже только под act */
function click(element: HTMLElement | null | undefined) {
    act(() => {
        element?.click();
    });
}

function getHost() {
    return document.getElementById(DEVTOOLS_ROOT_ID);
}

function getPanelText() {
    return getHost()?.shadowRoot?.querySelector('.panel')?.textContent ?? '';
}

describe('mountDevtools', () => {
    beforeEach(() => {
        delete globalWithDevtools[DEVTOOLS_GLOBAL_KEY];
        delete (globalThis as GlobalWithScopes).__webpack_share_scopes__;
        // панель помнит активную вкладку между загрузками страницы - между тестами это мешает
        sessionStorage.clear();
        document.body.innerHTML = '';
    });

    afterEach(() => {
        act(() => {
            unmountDevtools();
        });
    });

    it('should mount the panel into a shadow root', () => {
        mountPanel();

        const host = getHost();

        expect(host).not.toBeNull();
        expect(host?.shadowRoot?.querySelector('.panel')).not.toBeNull();
        // в светлом DOM панели нет - стили и разметка изолированы
        expect(document.querySelector('.panel')).toBeNull();
    });

    it('should render synchronously: the panel is in the DOM right after the call', () => {
        // на это полагаются вызывающие снаружи React: vanilla-версия рисовала синхронно,
        // и контракт mountDevtools() при переезде на React не поменялся. Вызов нарочно
        // без act - и без act-окружения, чтобы React не ругался на задуманное
        (globalThis as GlobalWithAct).IS_REACT_ACT_ENVIRONMENT = false;

        try {
            mountDevtools();

            expect(getHost()?.shadowRoot?.querySelector('.panel')).not.toBeNull();
        } finally {
            (globalThis as GlobalWithAct).IS_REACT_ACT_ENVIRONMENT = true;
        }
    });

    it('should not leak its styles into the page without shadow dom', () => {
        const { attachShadow } = Element.prototype;

        // @ts-expect-error проверяем поведение в браузере без Shadow DOM
        delete Element.prototype.attachShadow;

        try {
            mountPanel();

            const css = getHost()?.querySelector('style')?.textContent ?? '';

            // без shadow root <style> становится документным: .button, .header и .panel
            // приложения перекрасились бы в тёмную тему панели
            expect(css).not.toContain(':host');
            expect(css).toContain(`#${DEVTOOLS_ROOT_ID} .panel`);
            expect(css).not.toMatch(/(^|})\s*\.panel\s*{/);
        } finally {
            Element.prototype.attachShadow = attachShadow;
        }
    });

    it('should do nothing when the document has no body yet', () => {
        const { body } = document;

        body.remove();

        try {
            expect(() => mountPanel()).not.toThrow();
            expect(isDevtoolsMounted()).toBe(false);
        } finally {
            document.documentElement.appendChild(body);
        }
    });

    it('should not mark the host with the module resources attribute', () => {
        mountPanel();

        // по этому атрибуту загрузчик модулей вычищает ресурсы из DOM и снёс бы панель
        expect(getHost()?.hasAttribute('data-parent-app-id')).toBe(false);
    });

    it('should mount into a custom container', () => {
        const container = document.createElement('section');

        document.body.appendChild(container);
        mountPanel({ container });

        expect(container.querySelector(`#${DEVTOOLS_ROOT_ID}`)).not.toBeNull();
    });

    it('should show the waiting state when there is no store', () => {
        mountPanel();

        expect(getPanelText()).toContain('Ждём загрузчик модулей');
    });

    it('should show the unsupported state for a store of another version', () => {
        globalWithDevtools[DEVTOOLS_GLOBAL_KEY] = { version: 5 };
        mountPanel();

        expect(getPanelText()).toContain('Стор devtools версии 5');
        expect(getHost()?.shadowRoot?.querySelector('.status_error')).not.toBeNull();
    });

    it('should render the snapshot and follow its updates', () => {
        const store = putStore(createSnapshot(2, 3));

        mountPanel();

        expect(getPanelText()).toContain('Загрузок: 2 · событий: 3');

        store.emit(createSnapshot(4, 7));

        expect(getPanelText()).toContain('Загрузок: 4 · событий: 7');
    });

    it('should be idempotent', () => {
        const first = mountPanel();
        const second = mountPanel();

        expect(second).toBe(first);
        expect(document.querySelectorAll(`#${DEVTOOLS_ROOT_ID}`)).toHaveLength(1);
    });

    it('should remove everything on unmount', () => {
        const store = putStore(createSnapshot(1));
        const unmount = mountPanel();

        expect(store.listenersCount).toBe(1);

        act(() => unmount());

        expect(getHost()).toBeNull();
        expect(store.listenersCount).toBe(0);
        expect(isDevtoolsMounted()).toBe(false);
    });

    it('should survive a second unmount call', () => {
        const unmount = mountPanel();

        act(() => unmount());

        expect(() => act(() => unmount())).not.toThrow();
    });

    it('should close by the close button', () => {
        const onClose = jest.fn();

        mountPanel({ onClose });

        click(getHost()?.shadowRoot?.querySelector('.close') as HTMLButtonElement);

        expect(getHost()).toBeNull();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should close by Escape', () => {
        const onClose = jest.fn();

        mountPanel({ onClose });

        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });

        expect(getHost()).toBeNull();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close by Escape from a filled input', () => {
        mountPanel();

        const input = document.createElement('input');

        input.value = 'react';
        document.body.appendChild(input);

        // Esc в непустом фильтре - это «очистить поле». Закрывать заодно всю панель,
        // теряя вкладку и раскрытые строки, пользователь не просил
        act(() => {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        });

        expect(getHost()).not.toBeNull();

        input.remove();
    });

    it('should close by Escape from an empty input', () => {
        mountPanel();

        const input = document.createElement('input');

        document.body.appendChild(input);
        act(() => {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        });

        expect(getHost()).toBeNull();

        input.remove();
    });

    it('should not close by Escape already handled by the host app', () => {
        mountPanel();

        const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });

        event.preventDefault();
        act(() => {
            document.dispatchEvent(event);
        });

        expect(getHost()).not.toBeNull();
    });

    it('should stay removable when the very first render throws', () => {
        const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        // стор отдаёт снимок, на котором отрисовка спотыкается: ровно так выглядит запись,
        // приехавшая из sessionStorage от другой версии загрузчика
        const broken = {
            version: 1,
            get loads(): never[] {
                throw new Error('снимок сломан');
            },
            events: [],
        } as unknown as DevtoolsSnapshot;

        putStore(broken);

        const unmount = mountPanel();

        // панель смонтирована и знает об этом - иначе повторный вызов создаст второй хост
        expect(isDevtoolsMounted()).toBe(true);

        act(() => unmount());

        // и снимается полностью: ни хоста в странице, ни висящего слушателя на document
        expect(getHost()).toBeNull();
        expect(isDevtoolsMounted()).toBe(false);

        error.mockRestore();
    });

    it('should tell about the failed frame and recover on the next update', () => {
        const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const broken = {
            version: 1,
            get loads(): never[] {
                throw new Error('снимок сломан');
            },
            events: [],
        } as unknown as DevtoolsSnapshot;

        const store = putStore(broken);

        mountPanel();

        // кадр пропущен, но панель говорит об этом, а не показывает пустоту
        expect(getPanelText()).toContain('Не удалось отрисовать панель');

        // следующая нотификация стора - следующая попытка отрисовки
        store.emit(createSnapshot(2, 1));

        expect(getPanelText()).toContain('Загрузок: 2 · событий: 1');

        error.mockRestore();
    });

    it('should not leave a store subscription behind when the first render throws', () => {
        const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const store = putStore(createSnapshot(1));

        // ломаем отрисовку уже после подписки
        const broken = {
            version: 1,
            get loads(): never[] {
                throw new Error('снимок сломан');
            },
            events: [],
        } as unknown as DevtoolsSnapshot;

        const unmount = mountPanel();

        store.emit(broken);
        act(() => unmount());

        expect(store.listenersCount).toBe(0);

        error.mockRestore();
    });

    it('should render the loads table', () => {
        putStore(createSnapshot(2));
        mountPanel();

        expect(getHost()?.shadowRoot?.querySelectorAll('.row:not(.row_header)')).toHaveLength(2);
    });

    it('should switch to the share scope tab', () => {
        (globalThis as GlobalWithScopes).__webpack_share_scopes__ = {
            default: { react: { '18.3.1': { from: 'example', shareConfig: { singleton: true } } } },
        };
        putStore(createSnapshot(1));
        mountPanel();

        const shadow = getHost()?.shadowRoot;

        expect(shadow?.querySelector('.grid')).not.toBeNull();

        const shareTab = Array.from(shadow?.querySelectorAll('.tab') ?? []).find((tab) =>
            tab.textContent?.startsWith('Share scope'),
        ) as HTMLButtonElement;

        click(shareTab);

        expect(shadow?.querySelector('.grid')).toBeNull();
        expect(shadow?.querySelector('.share-scope')?.textContent).toContain('react');
        expect(shadow?.querySelector('.share-scope')?.textContent).toContain('18.3.1');
    });

    it('should refresh the share scope tab while it stays open', () => {
        const scopes = globalThis as GlobalWithScopes;

        scopes.__webpack_share_scopes__ = { default: {} };

        const store = putStore(createSnapshot(0));

        mountPanel();

        const shadow = getHost()?.shadowRoot;
        const shareTab = Array.from(shadow?.querySelectorAll('.tab') ?? []).find((tab) =>
            tab.textContent?.startsWith('Share scope'),
        ) as HTMLButtonElement;

        click(shareTab);

        expect(shadow?.querySelector('.share-scope')?.textContent).not.toContain('react');

        // модуль догрузился и положил react в скоуп уже при открытой вкладке
        scopes.__webpack_share_scopes__ = {
            default: { react: { '18.3.1': { from: 'example', shareConfig: { singleton: true } } } },
        };
        store.emit(createSnapshot(1));

        // без обновления в теле навсегда остался бы снимок на момент открытия
        expect(shadow?.querySelector('.share-scope')?.textContent).toContain('react');
    });

    it('should render the events tab', () => {
        putStore(createSnapshot(1, 2));
        mountPanel();

        const shadow = getHost()?.shadowRoot;
        const eventsTab = Array.from(shadow?.querySelectorAll('.tab') ?? []).find(
            (tab) => tab.textContent === 'События',
        ) as HTMLButtonElement;

        click(eventsTab);

        expect(shadow?.querySelectorAll('.row_event:not(.row_header)')).toHaveLength(2);
    });

    it('should restore the last active tab', () => {
        writePanelState({ tab: 'events' });
        putStore(createSnapshot(1, 1));
        mountPanel();

        const active = getHost()?.shadowRoot?.querySelector('.tab_active');

        expect(active?.textContent).toBe('События');
    });

    it('should fall back to the first tab when the stored one is unknown', () => {
        writePanelState({ tab: 'какая-то вкладка из будущего' });
        mountPanel();

        expect(getHost()?.shadowRoot?.querySelector('.tab_active')?.textContent).toBe('Модули');
    });

    it('should remember the tab the user switched to', () => {
        putStore(createSnapshot(1));
        mountPanel();

        const eventsTab = Array.from(getHost()?.shadowRoot?.querySelectorAll('.tab') ?? []).find(
            (tab) => tab.textContent === 'События',
        ) as HTMLButtonElement;

        click(eventsTab);

        expect(readPanelState().tab).toBe('events');
    });

    it('should count share scope problems in the tab title', () => {
        (globalThis as GlobalWithScopes).__webpack_share_scopes__ = {
            default: { react: { '17.0.2': {}, '18.3.1': {} } },
        };
        putStore(createSnapshot(1));
        mountPanel();

        const titles = Array.from(getHost()?.shadowRoot?.querySelectorAll('.tab') ?? []).map(
            (tab) => tab.textContent,
        );

        expect(titles).toContain('Share scope · проблем: 1');
    });

    it('should not react to Escape after unmount', () => {
        const onClose = jest.fn();

        mountPanel({ onClose });
        act(() => {
            unmountDevtools();
        });
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });

        expect(onClose).not.toHaveBeenCalled();
    });
});
