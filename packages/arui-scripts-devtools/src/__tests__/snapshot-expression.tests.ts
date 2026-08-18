import {
    DEVTOOLS_EVENT_BUS_NAMESPACE,
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    SUPPORTED_DEVTOOLS_VERSION,
    SUPPORTED_EVENT_BUS_VERSION,
    SUPPORTED_MODULES_VERSION,
} from '../constants';
import { SNAPSHOT_EXPRESSION } from '../extension/snapshot-expression';
import { type DevtoolsState } from '../types';

/**
 * Выражение выполняется на инспектируемой странице, а не у нас, поэтому и проверяем его так:
 * исполняем в функции со своим `window` - ровно то, что делает eval расширения.
 */
function evaluate(pageWindow: Record<string, unknown>): DevtoolsState {
    // предмет теста - именно строка, которую исполнит чужая страница, поэтому тут
    // без Function не обойтись: проверять надо ровно то, что уедет в eval
    // eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval
    return new Function('window', `return ${SNAPSHOT_EXPRESSION};`)(pageWindow) as DevtoolsState;
}

const SNAPSHOT = { version: 1, loads: [], events: [], shareScopes: [], sharedRequirements: {} };
const BUS_SNAPSHOT = { version: 1, events: [], listeners: [] };

describe('SNAPSHOT_EXPRESSION', () => {
    it('should wait when the page has no devtools global at all', () => {
        expect(evaluate({})).toMatchObject({
            modules: { status: 'waiting' },
            eventBus: { status: 'waiting' },
        });
    });

    it('should wait when the shell is there but no namespace filled it', () => {
        expect(evaluate({ [DEVTOOLS_GLOBAL_KEY]: { version: 1 } })).toMatchObject({
            modules: { status: 'waiting' },
            eventBus: { status: 'waiting' },
        });
    });

    it('should send the page clock along with the data', () => {
        // без него панель считает время по своему документу, а он открылся когда угодно
        expect(evaluate({}).page).toEqual({ timeOrigin: performance.timeOrigin });
    });

    it('should send the page clock even when the shell version is unknown', () => {
        // вкладки останутся пустыми, но время незавершённых стадий показывать всё равно нечем
        expect(evaluate({ [DEVTOOLS_GLOBAL_KEY]: { version: 42 } }).page).toEqual({
            timeOrigin: performance.timeOrigin,
        });
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

        expect(state.modules).toEqual({ status: 'ready', snapshot: SNAPSHOT });
    });

    it('should report an unsupported root version', () => {
        const state = evaluate({ [DEVTOOLS_GLOBAL_KEY]: { version: 42 } });

        // оболочка одна на все неймспейсы: незнакомая версия обесценивает оба
        expect(state.modules).toEqual({
            status: 'unsupported',
            found: 42,
            supported: SUPPORTED_DEVTOOLS_VERSION,
        });
        expect(state.eventBus).toEqual({
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

        expect(state.modules).toEqual({
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

        expect(state.modules).toEqual({ status: 'waiting' });
    });

    it('should read the event bus namespace too', () => {
        // неймспейсы независимы: их наполняют разные пакеты, каждый со своей версией
        const state = evaluate({
            [DEVTOOLS_GLOBAL_KEY]: {
                version: SUPPORTED_DEVTOOLS_VERSION,
                [DEVTOOLS_EVENT_BUS_NAMESPACE]: {
                    version: SUPPORTED_EVENT_BUS_VERSION,
                    getSnapshot: () => BUS_SNAPSHOT,
                },
            },
        });

        expect(state.eventBus).toEqual({ status: 'ready', snapshot: BUS_SNAPSHOT });
        expect(state.modules).toEqual({ status: 'waiting' });
    });

    it('should report an unsupported event bus version on its own', () => {
        const state = evaluate({
            [DEVTOOLS_GLOBAL_KEY]: {
                version: SUPPORTED_DEVTOOLS_VERSION,
                [DEVTOOLS_MODULES_NAMESPACE]: {
                    version: SUPPORTED_MODULES_VERSION,
                    getSnapshot: () => SNAPSHOT,
                },
                [DEVTOOLS_EVENT_BUS_NAMESPACE]: { version: 9, getSnapshot: () => BUS_SNAPSHOT },
            },
        });

        // сломанная шина не должна лишать данных загрузчик модулей
        expect(state.modules.status).toBe('ready');
        expect(state.eventBus).toEqual({
            status: 'unsupported',
            found: 9,
            supported: SUPPORTED_EVENT_BUS_VERSION,
        });
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

        expect(state.modules).toEqual({ status: 'waiting' });
    });

    it('should not use syntax the inspected page may not understand', () => {
        // выражение исполняется движком чужой страницы: стрелки и опциональные цепочки
        // тут не наши, чтобы ими рисковать
        expect(SNAPSHOT_EXPRESSION).not.toContain('=>');
        expect(SNAPSHOT_EXPRESSION).not.toContain('?.');
    });
});
