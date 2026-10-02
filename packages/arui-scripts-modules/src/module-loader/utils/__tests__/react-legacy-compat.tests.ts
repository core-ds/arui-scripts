import { enableLegacyReactCompat } from '../react-legacy-compat';

const LEGACY_INTERNALS_KEY = '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED';
const ELEMENT_KEY = 'react.element';
const TRANSITIONAL_ELEMENT_KEY = 'react.transitional.element';
const FRAGMENT_KEY = 'react.fragment';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReactGlobal = Record<string, any>;

function getReactGlobal(): ReactGlobal | undefined {
    return (window as Window & { react?: ReactGlobal }).react;
}

function setReactGlobal(value: ReactGlobal | undefined): void {
    if (value === undefined) {
        delete (window as Window & { react?: ReactGlobal }).react;

        return;
    }
    (window as Window & { react?: ReactGlobal }).react = value;
}

describe('enableLegacyReactCompat', () => {
    const originalSymbolFor = Symbol.for;
    const originalReact = getReactGlobal();

    let disableCurrent: (() => void) | undefined;

    afterEach(() => {
        disableCurrent?.();
        disableCurrent = undefined;
        Symbol.for = originalSymbolFor;
        setReactGlobal(originalReact);
    });

    describe('no-op, когда шим не нужен', () => {
        it('ничего не делает, если window.react отсутствует', () => {
            setReactGlobal(undefined);

            const disable = enableLegacyReactCompat();

            expect(Symbol.for).toBe(originalSymbolFor);
            disable();
        });

        it('не трогает Symbol.for и не добавляет internals для React 18', () => {
            setReactGlobal({ version: '18.2.0' });
            const classicElement = Symbol.for(ELEMENT_KEY);

            const disable = enableLegacyReactCompat();

            expect(Symbol.for(ELEMENT_KEY)).toBe(classicElement);
            expect(getReactGlobal()?.[LEGACY_INTERNALS_KEY]).toBeUndefined();
            disable();
        });

        it('не перезаписывает уже существующие internals (не вмешиваемся в чужой полифилл)', () => {
            const existingInternals = { ReactCurrentDispatcher: { current: {} } };

            setReactGlobal({ version: '19.1.6', [LEGACY_INTERNALS_KEY]: existingInternals });
            const classicElement = Symbol.for(ELEMENT_KEY);

            const disable = enableLegacyReactCompat();

            expect(Symbol.for(ELEMENT_KEY)).toBe(classicElement);
            expect(getReactGlobal()?.[LEGACY_INTERNALS_KEY]).toBe(existingInternals);
            disable();
        });
    });

    describe('на React 19 хостах', () => {
        it('добавляет ReactCurrentOwner-полифилл и перенаправляет react.element на transitional', () => {
            setReactGlobal({ version: '19.1.6' });
            const classicFragment = Symbol.for(FRAGMENT_KEY);

            const disable = enableLegacyReactCompat();

            const internals = getReactGlobal()?.[LEGACY_INTERNALS_KEY] as {
                ReactCurrentOwner: { current: unknown };
            };

            expect(internals.ReactCurrentOwner.current).toBeNull();
            expect(Symbol.for(ELEMENT_KEY)).toBe(Symbol.for(TRANSITIONAL_ELEMENT_KEY));
            // остальные символы не трогаем
            expect(Symbol.for(FRAGMENT_KEY)).toBe(classicFragment);
            disable();
        });

        it('заставляет легаси jsx-рантайм создавать элементы, принимаемые react-dom 19', () => {
            setReactGlobal({ version: '19.1.6' });

            const disable = enableLegacyReactCompat();

            // ровно то, что делает реакт-18-рантайм на верхнем уровне модуля
            const elementType = Symbol.for(ELEMENT_KEY);
            const owner = getReactGlobal()?.[LEGACY_INTERNALS_KEY].ReactCurrentOwner;
            const element = {
                $$typeof: elementType,
                type: 'div',
                key: null,
                ref: null,
                props: { children: 'hello' },
                // имя поля — часть контракта react-элемента
                // eslint-disable-next-line no-underscore-dangle
                _owner: owner.current,
            };

            expect(element.$$typeof).toBe(Symbol.for(TRANSITIONAL_ELEMENT_KEY));
            // eslint-disable-next-line no-underscore-dangle
            expect(element._owner).toBeNull();
            disable();
        });
    });

    describe('восстановление состояния', () => {
        it('после disable возвращает Symbol.for и удаляет созданный полифилл', () => {
            setReactGlobal({ version: '19.1.6' });
            const classicElement = Symbol.for(ELEMENT_KEY);

            const disable = enableLegacyReactCompat();

            expect(Symbol.for(ELEMENT_KEY)).not.toBe(classicElement);

            disable();

            expect(Symbol.for(ELEMENT_KEY)).toBe(classicElement);
            expect(getReactGlobal()?.[LEGACY_INTERNALS_KEY]).toBeUndefined();
        });

        it('поддерживает вложенные/одновременные подключения через счётчик', () => {
            setReactGlobal({ version: '19.1.6' });
            const classicElement = Symbol.for(ELEMENT_KEY);

            const disable1 = enableLegacyReactCompat();
            const disable2 = enableLegacyReactCompat();

            // первый restore не должен снять шим, пока активен второй
            disable1();
            expect(Symbol.for(ELEMENT_KEY)).not.toBe(classicElement);
            expect(getReactGlobal()?.[LEGACY_INTERNALS_KEY]).toBeDefined();

            disable2();
            expect(Symbol.for(ELEMENT_KEY)).toBe(classicElement);
            expect(getReactGlobal()?.[LEGACY_INTERNALS_KEY]).toBeUndefined();
        });

        it('повторный disable безопасен (не падает и ничего не ломает)', () => {
            setReactGlobal({ version: '19.1.6' });

            const disable = enableLegacyReactCompat();

            disable();
            disable();
        });
    });
});
