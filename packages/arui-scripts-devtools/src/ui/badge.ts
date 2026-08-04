import { scopeStyles } from './scope-styles';

/** id хост-элемента бейджа в светлом DOM */
export const DEVTOOLS_BADGE_ID = 'arui-devtools-badge';

/**
 * Стили бейджа. Значения - те же токены дизайн-системы, что и у панели, но лист свой:
 * бейдж лежит в основном бандле, а импорт из `ui/styles` притащил бы туда всю панель.
 */
export const BADGE_STYLES = `
:host {
    all: initial;

    --arui-devtools-bg: var(--color-dark-bg-primary, #0b1f35);
    --arui-devtools-bg-hover: var(--color-dark-bg-primary-tint-7, rgb(28, 47, 67));
    --arui-devtools-text: var(--color-dark-text-primary, #fff);
    --arui-devtools-font: var(--font-family-system, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, sans-serif);
    --arui-devtools-shadow: var(--shadow-m, 0 0 16px rgba(11, 31, 53, 0.08), 0 8px 16px rgba(11, 31, 53, 0.16));
}

/* Button, size xxs: высота 32, padding 0 15px, скругление 6, подпись 14/20 весом 500 */
.badge {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 2147483646;
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 15px;
    border: none;
    border-radius: 6px;
    background: var(--arui-devtools-bg);
    box-shadow: var(--arui-devtools-shadow);
    color: var(--arui-devtools-text);
    font-family: var(--arui-devtools-font);
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    opacity: 0.65;
    cursor: pointer;
    transition: opacity 0.2s ease, background 0.2s ease;
}

.badge:hover {
    background: var(--arui-devtools-bg-hover);
    opacity: 1;
}
`;

/**
 * Маленькая кнопка в углу экрана: способ открыть панель, не зная хоткея.
 *
 * Бейдж живёт в eager-части энтрипоинта, поэтому у него свои инлайновые стили и никакого
 * общего кода с панелью — иначе панель приехала бы в основной бандл вместе с ним.
 *
 * @returns функция, убирающая бейдж со страницы
 */
export function mountBadge(onClick: () => void): () => void {
    if (typeof document === 'undefined' || !document.body) {
        return () => undefined;
    }

    const host = document.createElement('div');

    host.id = DEVTOOLS_BADGE_ID;

    const shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : undefined;
    const root: ShadowRoot | HTMLElement = shadow ?? host;

    const style = document.createElement('style');

    // без shadow root стили стали бы документными, а `.badge` есть и в самой панели,
    // и вполне может быть в приложении
    style.textContent = shadow ? BADGE_STYLES : scopeStyles(BADGE_STYLES, `#${DEVTOOLS_BADGE_ID}`);

    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'badge';
    button.textContent = 'arui devtools';
    button.title = 'Открыть панель отладки модулей (Ctrl/Cmd+Shift+M)';
    button.addEventListener('click', onClick);

    root.appendChild(style);
    root.appendChild(button);
    document.body.appendChild(host);

    return () => {
        button.removeEventListener('click', onClick);
        host.remove();
    };
}
