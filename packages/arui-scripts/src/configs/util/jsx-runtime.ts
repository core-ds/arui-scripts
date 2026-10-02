import React from 'react';

type JsxElement = {
    $$typeof: symbol;
    type: unknown;
    key: string | null;
    ref: unknown;
    props: Record<string, unknown> & { children?: unknown };
    _owner: null;
};

type JsxConfig = Record<string, unknown>;

const excludedProps = new Set(['key', '__self', '__source']);

/**
 * Самостоятельная реализация JSX runtime, совместимая и с React 18, и с React 19.
 *
 * SWC компилирует JSX в вызовы "react/jsx-runtime", поэтому весь JSX приложения
 * рендерится через этот модуль (когда включен флаг `pinJsxRuntime`, см. app-configs).
 * Проблема в том, что разные мажорные версии React используют разные типы элементов:
 *  - React 19 помечает элементы Symbol.for("react.transitional.element")
 *    и в throwOnInvalidObjectType падает при попытке отрендерить элемент
 *    "react.transitional.element"-типа; обычные (Symbol.for("react.element")) элементы
 *    он грузит как "A React Element from an older version of React was rendered" —
 *    и в dev, и в prod.
 *  - React 18 понимает только Symbol.for("react.element").
 *
 * Если код исполняется внутри React-приложений разных мажорных версий, нельзя
 * захардкодить один тип. Тип выбирается так же, как в react-redux: по версии
 * хостового react в момент создания элемента.
 * Стандартные jsx-рантаймы React нельзя подставить напрямую: они либо используют
 * __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED (React 19 его убрал — падение
 * при SSR), либо жёстко зашивают свой тип элемента.
 *
 * Семантика элементов различается между версиями, поэтому здесь параметры
 * совместимы сразу с обеими:
 *  - ref записывается и в props.ref (React 19 читает fiber.ref именно оттуда:
 *    ref-as-prop), и в element.ref (классическое место для React 18).
 *  - key всегда в element.key, из props исключается.
 *  - _owner: null — доступ React DevTools к owner'у не используется ни одной
 *    из версий при рендере, а реальный owner из недокументированных интерналов
 *    брать нельзя (React 19 не экспортирует __SECRET_INTERNALS).
 */
const ELEMENT_TYPE = Symbol.for(
    Number.parseInt(React.version, 10) >= 19 ? 'react.transitional.element' : 'react.element',
);

const stringifyKey = (value: unknown): string => {
    if (value === null) {
        return 'null';
    }

    if (typeof value === 'symbol') {
        return value.description ?? '';
    }

    if (typeof value === 'object') {
        // Намеренно повторяем поведение react: '' + значение ключа.
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return String(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- намеренно повторяем поведение react: '' + значение ключа
    return String(value);
};

const createJsxElement = (type: unknown, config: JsxConfig, maybeKey?: unknown): JsxElement => {
    const props: JsxConfig = {};

    for (const propName of Object.keys(config)) {
        if (!excludedProps.has(propName)) {
            props[propName] = config[propName];
        }
    }

    const defaultProps = (type as { defaultProps?: JsxConfig } | null)?.defaultProps;

    if (typeof defaultProps === 'object' && defaultProps !== null) {
        for (const propName of Object.keys(defaultProps)) {
            if (props[propName] === undefined) {
                props[propName] = defaultProps[propName];
            }
        }
    }

    let key: string | null = null;
    let ref: unknown = null;

    if (maybeKey !== undefined) {
        key = stringifyKey(maybeKey);
    }

    if (config.key !== undefined) {
        key = stringifyKey(config.key);
    }

    if (config.ref !== undefined) {
        ref = config.ref;
    }

    return {
        $$typeof: ELEMENT_TYPE,
        type,
        key,
        ref,
        props,
        _owner: null,
    };
};

export const Fragment = Symbol.for('react.fragment');

export const jsx = createJsxElement;

export const jsxs = createJsxElement;

export const jsxDEV = createJsxElement;

export default jsx;
