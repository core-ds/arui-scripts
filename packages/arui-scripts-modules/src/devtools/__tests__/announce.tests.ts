import { DEVTOOLS_READY_EVENT } from '../announce';
import { DEVTOOLS_GLOBAL_KEY, getDevtoolsModulesStore } from '../store';

describe('событие о появлении стора', () => {
    let listener: jest.Mock;

    beforeEach(() => {
        delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
        sessionStorage.clear();
        listener = jest.fn();
        window.addEventListener(DEVTOOLS_READY_EVENT, listener);
    });

    afterEach(() => {
        window.removeEventListener(DEVTOOLS_READY_EVENT, listener);
    });

    it('шлётся при создании стора', () => {
        getDevtoolsModulesStore();

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('не повторяется на последующих обращениях', () => {
        getDevtoolsModulesStore();
        getDevtoolsModulesStore();
        getDevtoolsModulesStore();

        // стор создаётся один раз на страницу - и событие тоже одно
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('не роняет загрузку модуля там, где нет CustomEvent', () => {
        const original = window.CustomEvent;

        // старые окружения и часть тестовых сред; событие - не обязательство,
        // стор обязан появиться в любом случае
        delete (window as Partial<Window & typeof globalThis>).CustomEvent;

        try {
            expect(() => getDevtoolsModulesStore()).not.toThrow();
            expect(getDevtoolsModulesStore()).toBeDefined();
            expect(listener).not.toHaveBeenCalled();
        } finally {
            window.CustomEvent = original;
        }
    });
});
