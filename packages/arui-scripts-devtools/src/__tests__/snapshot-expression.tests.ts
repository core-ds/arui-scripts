import {
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    SUPPORTED_DEVTOOLS_VERSION,
    SUPPORTED_MODULES_VERSION,
} from '../constants';
import { SNAPSHOT_EXPRESSION } from '../extension/snapshot-expression';
import { type ModulesStoreState } from '../types';

/**
 * Выражение выполняется на инспектируемой странице, а не у нас, поэтому и проверяем его так:
 * исполняем в функции со своим `window` - ровно то, что делает eval расширения.
 */
function evaluate(pageWindow: Record<string, unknown>): ModulesStoreState {
    // предмет теста - именно строка, которую исполнит чужая страница, поэтому тут
    // без Function не обойтись: проверять надо ровно то, что уедет в eval
    // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
    return new Function('window', `return ${SNAPSHOT_EXPRESSION};`)(pageWindow) as ModulesStoreState;
}

const SNAPSHOT = { version: 1, loads: [], events: [], shareScopes: [] };

describe('SNAPSHOT_EXPRESSION', () => {
    it('should wait when the page has no devtools global at all', () => {
        expect(evaluate({})).toEqual({ status: 'waiting' });
    });

    it('should wait when the loader is there but no module was loaded yet', () => {
        expect(evaluate({ [DEVTOOLS_GLOBAL_KEY]: { version: 1 } })).toEqual({ status: 'waiting' });
    });

    it('should return the snapshot', () => {
        const state = evaluate({
            [DEVTOOLS_GLOBAL_KEY]: {
                version: SUPPORTED_DEVTOOLS_VERSION,
                [DEVTOOLS_MODULES_NAMESPACE]: {
                    version: SUPPORTED_MODULES_VERSION,
                    getSnapshot: () => SNAPSHOT,
                },
            },
        });

        expect(state).toEqual({ status: 'ready', snapshot: SNAPSHOT });
    });

    it('should report an unsupported root version', () => {
        const state = evaluate({ [DEVTOOLS_GLOBAL_KEY]: { version: 42 } });

        expect(state).toEqual({
            status: 'unsupported',
            found: 42,
            supported: SUPPORTED_DEVTOOLS_VERSION,
        });
    });

    it('should report an unsupported namespace version', () => {
        const state = evaluate({
            [DEVTOOLS_GLOBAL_KEY]: {
                version: SUPPORTED_DEVTOOLS_VERSION,
                [DEVTOOLS_MODULES_NAMESPACE]: { version: 7, getSnapshot: () => SNAPSHOT },
            },
        });

        expect(state).toEqual({
            status: 'unsupported',
            found: 7,
            supported: SUPPORTED_MODULES_VERSION,
        });
    });

    it('should wait when the store does not look like a store', () => {
        const state = evaluate({
            [DEVTOOLS_GLOBAL_KEY]: {
                version: SUPPORTED_DEVTOOLS_VERSION,
                [DEVTOOLS_MODULES_NAMESPACE]: { version: SUPPORTED_MODULES_VERSION },
            },
        });

        expect(state).toEqual({ status: 'waiting' });
    });

    it('should wait instead of throwing into the inspected page', () => {
        // бросок отсюда прилетел бы в консоль чужого приложения, а не в нашу
        const state = evaluate({
            [DEVTOOLS_GLOBAL_KEY]: {
                version: SUPPORTED_DEVTOOLS_VERSION,
                [DEVTOOLS_MODULES_NAMESPACE]: {
                    version: SUPPORTED_MODULES_VERSION,
                    getSnapshot: () => {
                        throw new Error('стор сломан');
                    },
                },
            },
        });

        expect(state).toEqual({ status: 'waiting' });
    });

    it('should not use syntax the inspected page may not understand', () => {
        // выражение исполняется движком чужой страницы: стрелки и опциональные цепочки
        // тут не наши, чтобы ими рисковать
        expect(SNAPSHOT_EXPRESSION).not.toContain('=>');
        expect(SNAPSHOT_EXPRESSION).not.toContain('?.');
    });
});
