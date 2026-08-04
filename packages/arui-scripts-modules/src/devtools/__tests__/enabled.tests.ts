import { DEVTOOLS_ENABLED_KEY } from '../enabled';
import type * as reportModule from '../report';
import * as storeModule from '../store';

const { DEVTOOLS_GLOBAL_KEY, DEVTOOLS_STORAGE_KEY } = storeModule;

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

/**
 * Решение о сборе кешируется в модуле на всю жизнь страницы, поэтому каждый сценарий
 * должен получить свежую копию модулей — иначе он унаследует решение предыдущего.
 */
function loadModules() {
    jest.resetModules();

    /* eslint-disable @typescript-eslint/no-var-requires, global-require */
    const store = require('../store') as typeof storeModule;
    const report = require('../report') as typeof reportModule;
    /* eslint-enable @typescript-eslint/no-var-requires, global-require */

    return { store, report };
}

function getGlobalRoot() {
    return (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
}

describe('гейт сбора диагностики', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
    });

    afterEach(() => {
        process.env.NODE_ENV = ORIGINAL_NODE_ENV;
    });

    it('в dev-сборке собирает без всякого флага', () => {
        process.env.NODE_ENV = 'development';

        const { store } = loadModules();

        expect(store.getDevtoolsModulesStore()).toBeDefined();
    });

    it('в прод-сборке без флага не собирает и не создаёт глобал', () => {
        process.env.NODE_ENV = 'production';

        const { store } = loadModules();

        expect(store.getDevtoolsModulesStore()).toBeUndefined();
        expect(getGlobalRoot()).toBeUndefined();
    });

    it('в прод-сборке без флага ничего не пишет в sessionStorage', () => {
        process.env.NODE_ENV = 'production';

        const { report } = loadModules();

        report.reportLoadStart({ moduleId: 'm', hostAppId: 'host', shareScope: 'default' });

        expect(sessionStorage.getItem(DEVTOOLS_STORAGE_KEY)).toBeNull();
    });

    it('в прод-сборке репортёры затухают, а загрузка модуля не ломается', () => {
        process.env.NODE_ENV = 'production';

        const { report } = loadModules();
        const loadId = report.reportLoadStart({
            moduleId: 'm',
            hostAppId: 'host',
            shareScope: 'default',
        });

        expect(loadId).toBeUndefined();

        // все остальные репортёры должны молча пережить отсутствие loadId
        expect(() => {
            report.reportStageStart(loadId, 'fetch-manifest');
            report.reportStageEnd(loadId, 'fetch-manifest');
            report.reportLoadUpdate(loadId, { fromCache: true });
            report.reportLoadError(loadId, 'factory', new Error('boom'));
            report.reportLoadSuccess(loadId);
            report.reportUnmount(loadId);
        }).not.toThrow();
    });

    it('в прод-сборке просыпается по флагу в localStorage — сценарий стенда', () => {
        process.env.NODE_ENV = 'production';
        localStorage.setItem(DEVTOOLS_ENABLED_KEY, '1');

        const { store } = loadModules();

        expect(store.getDevtoolsModulesStore()).toBeDefined();
    });

    it('в dev-сборке выключается флагом', () => {
        process.env.NODE_ENV = 'development';
        localStorage.setItem(DEVTOOLS_ENABLED_KEY, 'off');

        const { store } = loadModules();

        expect(store.getDevtoolsModulesStore()).toBeUndefined();
    });

    it('не спотыкается о недоступный localStorage', () => {
        process.env.NODE_ENV = 'development';

        const getItem = jest
            .spyOn(Storage.prototype, 'getItem')
            .mockImplementation((key: string) => {
                if (key === DEVTOOLS_ENABLED_KEY) {
                    throw new Error('доступ к localStorage запрещён');
                }

                return null;
            });

        const { store } = loadModules();

        // флаг прочитать не удалось — падаем обратно на решение по сборке
        expect(store.getDevtoolsModulesStore()).toBeDefined();

        getItem.mockRestore();
    });
});
