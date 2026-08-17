import {
    DEVTOOLS_BADGE_ID,
    DEVTOOLS_ENABLED_KEY,
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    DEVTOOLS_READY_EVENT,
    DEVTOOLS_ROOT_ID,
    SUPPORTED_DEVTOOLS_VERSION,
    SUPPORTED_MODULES_VERSION,
} from '../constants';
import { installDevtools, isDevtoolsEnabled, isToggleHotkey } from '../install';
import { unmountDevtools } from '../mount';
import { readPanelState, writePanelState } from '../utils/panel-state';

function flush() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

function getBadgeButton() {
    return document.getElementById(DEVTOOLS_BADGE_ID)?.shadowRoot?.querySelector('.badge') as
        | HTMLButtonElement
        | undefined;
}

function pressHotkey() {
    document.dispatchEvent(
        new KeyboardEvent('keydown', { code: 'KeyM', key: 'M', ctrlKey: true, shiftKey: true }),
    );
}

/**
 * Кладёт на страницу стор загрузчика модулей. Без него бейджа не будет: панель показывает его
 * только когда модули на странице действительно грузят.
 */
function seedModulesStore() {
    (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY] = {
        version: SUPPORTED_DEVTOOLS_VERSION,
        [DEVTOOLS_MODULES_NAMESPACE]: {
            version: SUPPORTED_MODULES_VERSION,
            getSnapshot: () => ({ version: SUPPORTED_MODULES_VERSION, loads: [], events: [] }),
            subscribe: () => () => undefined,
        },
    };
}

function clearModulesStore() {
    delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
}

/** имитирует событие, которым загрузчик сообщает о появлении стора */
function announceStore() {
    seedModulesStore();
    window.dispatchEvent(new CustomEvent(DEVTOOLS_READY_EVENT));
}

describe('install', () => {
    const initialNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        localStorage.clear();
        // панель помнит себя между загрузками страницы - между тестами эта память мешает
        sessionStorage.clear();
        document.body.innerHTML = '';
        clearModulesStore();
    });

    afterEach(() => {
        process.env.NODE_ENV = initialNodeEnv;
        unmountDevtools();
    });

    describe('isDevtoolsEnabled', () => {
        it('should be enabled in a dev build', () => {
            process.env.NODE_ENV = 'development';

            expect(isDevtoolsEnabled()).toBe(true);
        });

        it('should be disabled in a production build', () => {
            process.env.NODE_ENV = 'production';

            expect(isDevtoolsEnabled()).toBe(false);
        });

        it('should be enabled in production by the flag', () => {
            process.env.NODE_ENV = 'production';
            localStorage.setItem(DEVTOOLS_ENABLED_KEY, '1');

            expect(isDevtoolsEnabled()).toBe(true);
        });

        it('should be disabled in dev by the flag', () => {
            process.env.NODE_ENV = 'development';
            localStorage.setItem(DEVTOOLS_ENABLED_KEY, 'off');

            expect(isDevtoolsEnabled()).toBe(false);
        });

        it('should ignore an unknown flag value', () => {
            process.env.NODE_ENV = 'production';
            localStorage.setItem(DEVTOOLS_ENABLED_KEY, 'maybe');

            expect(isDevtoolsEnabled()).toBe(false);
        });
    });

    describe('isToggleHotkey', () => {
        it.each([
            ['ctrl+shift+M', { code: 'KeyM', ctrlKey: true, shiftKey: true }, true],
            ['cmd+shift+M', { code: 'KeyM', metaKey: true, shiftKey: true }, true],
            ['ctrl+shift+M without code', { key: 'm', ctrlKey: true, shiftKey: true }, true],
            ['ctrl+M', { code: 'KeyM', ctrlKey: true }, false],
            ['shift+M', { code: 'KeyM', shiftKey: true }, false],
            [
                'ctrl+alt+shift+M',
                { code: 'KeyM', ctrlKey: true, shiftKey: true, altKey: true },
                false,
            ],
            ['ctrl+shift+K', { code: 'KeyK', key: 'K', ctrlKey: true, shiftKey: true }, false],
        ])('should detect %s', (_, init, expected) => {
            expect(isToggleHotkey(new KeyboardEvent('keydown', init))).toBe(expected);
        });
    });

    describe('installDevtools', () => {
        it('should do nothing when disabled', () => {
            process.env.NODE_ENV = 'production';

            const uninstall = installDevtools();

            pressHotkey();

            expect(getBadgeButton()).toBeUndefined();
            expect(document.getElementById(DEVTOOLS_ROOT_ID)).toBeNull();

            uninstall();
        });

        it('should show the badge without loading the panel', () => {
            seedModulesStore();

            const uninstall = installDevtools();

            expect(getBadgeButton()).toBeDefined();
            expect(document.getElementById(DEVTOOLS_ROOT_ID)).toBeNull();

            uninstall();
        });

        it('should not show the badge in an app that does not load modules', () => {
            // стора нет - значит ни одной попытки загрузить модуль не было,
            // и показывать в панели нечего
            const uninstall = installDevtools();

            expect(getBadgeButton()).toBeUndefined();

            uninstall();
        });

        it('should show the badge when the loader announces the store later', () => {
            const uninstall = installDevtools();

            expect(getBadgeButton()).toBeUndefined();

            // первый модуль поехал уже после старта страницы
            announceStore();

            expect(getBadgeButton()).toBeDefined();

            uninstall();
        });

        it('should keep the hotkey working without any modules', async () => {
            const uninstall = installDevtools();

            expect(getBadgeButton()).toBeUndefined();

            // без бейджа панель всё равно должна открываться - хотя бы чтобы сказать,
            // что модулей на странице нет
            pressHotkey();
            await flush();

            expect(document.getElementById(DEVTOOLS_ROOT_ID)).not.toBeNull();

            uninstall();
        });

        it('should stop reacting to the store event after uninstall', () => {
            const uninstall = installDevtools();

            uninstall();
            announceStore();

            expect(getBadgeButton()).toBeUndefined();
        });

        it('should open the panel by the badge', async () => {
            seedModulesStore();

            const uninstall = installDevtools();

            getBadgeButton()?.click();
            await flush();

            expect(document.getElementById(DEVTOOLS_ROOT_ID)).not.toBeNull();

            uninstall();
        });

        it('should toggle the panel by the hotkey', async () => {
            const uninstall = installDevtools();

            pressHotkey();
            await flush();

            expect(document.getElementById(DEVTOOLS_ROOT_ID)).not.toBeNull();

            pressHotkey();
            await flush();

            expect(document.getElementById(DEVTOOLS_ROOT_ID)).toBeNull();

            uninstall();
        });

        it('should remove the badge and the panel on uninstall', async () => {
            const uninstall = installDevtools();

            pressHotkey();
            await flush();

            uninstall();

            expect(getBadgeButton()).toBeUndefined();
            expect(document.getElementById(DEVTOOLS_ROOT_ID)).toBeNull();

            pressHotkey();
            await flush();

            expect(document.getElementById(DEVTOOLS_ROOT_ID)).toBeNull();
        });

        it('should reopen the panel that was open before the reload', async () => {
            writePanelState({ open: true });

            const uninstall = installDevtools();

            await flush();

            expect(document.getElementById(DEVTOOLS_ROOT_ID)).not.toBeNull();

            uninstall();
        });

        it('should not reopen a panel that was closed', async () => {
            writePanelState({ open: false });

            const uninstall = installDevtools();

            await flush();

            expect(document.getElementById(DEVTOOLS_ROOT_ID)).toBeNull();

            uninstall();
        });

        it('should remember opening and closing the panel', async () => {
            const uninstall = installDevtools();

            pressHotkey();
            await flush();

            expect(readPanelState().open).toBe(true);

            pressHotkey();
            await flush();

            expect(readPanelState().open).toBe(false);

            uninstall();
        });

        it('should wait for body when the document is not ready yet', () => {
            const { body } = document;

            seedModulesStore();
            // энтрипоинт может выполниться раньше, чем браузер разберёт body
            Object.defineProperty(document, 'body', { value: null, configurable: true });

            const uninstall = installDevtools();

            expect(getBadgeButton()).toBeUndefined();

            Object.defineProperty(document, 'body', { value: body, configurable: true });
            document.dispatchEvent(new Event('DOMContentLoaded'));

            expect(getBadgeButton()).toBeDefined();

            uninstall();
        });

        it('should not show the badge before body even if the store is already there', () => {
            const { body } = document;

            Object.defineProperty(document, 'body', { value: null, configurable: true });

            const uninstall = installDevtools();

            // стор появился раньше, чем разобрали документ - вешать бейдж пока некуда
            announceStore();

            expect(getBadgeButton()).toBeUndefined();

            Object.defineProperty(document, 'body', { value: body, configurable: true });
            document.dispatchEvent(new Event('DOMContentLoaded'));

            expect(getBadgeButton()).toBeDefined();

            uninstall();
        });
    });
});
