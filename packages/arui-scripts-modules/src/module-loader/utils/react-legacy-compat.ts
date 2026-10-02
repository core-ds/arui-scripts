/**
 * Совместимость с легаси (React 18) compat-модулями на хостах с React 19+.
 *
 * Compat-модули по-прежнему собираются с рантаймом `react/jsx-runtime` из React 18.
 * На верхнем уровне такой рантайм читает
 * `react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner`,
 * которого в React 19 больше нет, поэтому eval чанка падает с
 * `TypeError: Cannot read properties of undefined (reading 'ReactCurrentOwner')`.
 * Если при этом просто подменить internals, легаси-рантайм начнёт создавать
 * классические элементы (`Symbol.for('react.element')`), которые react-dom 19
 * отказывается рендерить.
 *
 * Шим на время выполнения ресурсов модуля:
 *  - добавляет в react-объект хоста недостающие internals;
 *  - переопределяет `Symbol.for`, чтобы ключ `react.element` отдавал
 *    transitional-символ `react.transitional.element`, который в React 19 считается
 *    элементом.
 * После выполнения ресурсов всё восстанавливается.
 */

const LEGACY_REACT_INTERNALS_KEY = '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED';
const REACT_ELEMENT_SYMBOL_KEY = 'react.element';
const TRANSITIONAL_ELEMENT_SYMBOL_KEY = 'react.transitional.element';

let activeInstallCount = 0;
let originalSymbolFor: ((key: string) => symbol) | null = null;
let installedReactGlobal: ReactGlobal = null;
let installedLegacyInternals = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReactGlobal = Record<string, any> | null;

/**
 * Включает во время выполнения ресурсов модуля совместимость с легаси-рантаймом.
 * Возвращает функцию выключения. Шим счётчиковый: при параллельной загрузке
 * нескольких модулей состояние будет восстановлено после последнего выключения.
 */
export function enableLegacyReactCompat(): () => void {
    const reactGlobal = getReactGlobal();

    if (reactGlobal == null) {
        return () => {};
    }

    const alreadyInstalled = originalSymbolFor !== null;

    if (!alreadyInstalled && !shouldEnableLegacyReactCompat(reactGlobal)) {
        return () => {};
    }

    if (!alreadyInstalled) {
        const original = Symbol.for.bind(Symbol);

        originalSymbolFor = original;
        installedReactGlobal = reactGlobal;
        installedLegacyInternals = !Object.prototype.hasOwnProperty.call(
            reactGlobal,
            LEGACY_REACT_INTERNALS_KEY,
        );
        if (installedLegacyInternals) {
            reactGlobal[LEGACY_REACT_INTERNALS_KEY] = { ReactCurrentOwner: { current: null } };
        }

        Symbol.for = (key) =>
            key === REACT_ELEMENT_SYMBOL_KEY
                ? original(TRANSITIONAL_ELEMENT_SYMBOL_KEY)
                : original(key);
    }
    activeInstallCount += 1;

    return () => {
        if (activeInstallCount <= 0) {
            return;
        }
        activeInstallCount -= 1;
        if (activeInstallCount !== 0 || originalSymbolFor === null) {
            return;
        }

        Symbol.for = originalSymbolFor;
        originalSymbolFor = null;

        if (installedLegacyInternals && installedReactGlobal !== null) {
            delete installedReactGlobal[LEGACY_REACT_INTERNALS_KEY];
        }
        installedLegacyInternals = false;
        installedReactGlobal = null;
    };
}

function shouldEnableLegacyReactCompat(reactGlobal: ReactGlobal): boolean {
    return (
        reactGlobal !== null &&
        reactGlobal !== undefined &&
        parseInt(String(reactGlobal.version ?? ''), 10) >= 19 &&
        !Object.prototype.hasOwnProperty.call(reactGlobal, LEGACY_REACT_INTERNALS_KEY)
    );
}

function getReactGlobal(): ReactGlobal {
    if (typeof window === 'undefined') {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).react as ReactGlobal;
}
