import { createHint } from '../ui/hint';

function getTooltip(hint: HTMLElement) {
    return hint.querySelector('.hint__tooltip') as HTMLElement;
}

function isVisible(hint: HTMLElement) {
    return getTooltip(hint).classList.contains('hint__tooltip_visible');
}

describe('createHint', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should keep the text hidden until asked', () => {
        const hint = createHint('Загрузка манифеста провайдера');

        expect(getTooltip(hint).textContent).toBe('Загрузка манифеста провайдера');
        expect(isVisible(hint)).toBe(false);
    });

    it('should be a button a screen reader can announce', () => {
        const hint = createHint('текст подсказки');

        expect(hint.tagName).toBe('BUTTON');
        expect(hint.getAttribute('type')).toBe('button');
        expect(hint.getAttribute('aria-label')).toBeTruthy();
        // подсказку связываем с кнопкой, иначе скринридер прочитает только «кнопка»
        expect(hint.getAttribute('aria-describedby')).toBe(getTooltip(hint).id);
    });

    it('should show the text on hover and hide it on leave', () => {
        const hint = createHint('текст подсказки');

        document.body.appendChild(hint);

        hint.dispatchEvent(new MouseEvent('mouseenter'));
        expect(isVisible(hint)).toBe(true);

        hint.dispatchEvent(new MouseEvent('mouseleave'));
        expect(isVisible(hint)).toBe(false);
    });

    it('should show the text on keyboard focus', () => {
        const hint = createHint('текст подсказки');

        document.body.appendChild(hint);

        hint.dispatchEvent(new FocusEvent('focus'));
        expect(isVisible(hint)).toBe(true);

        hint.dispatchEvent(new FocusEvent('blur'));
        expect(isVisible(hint)).toBe(false);
    });

    it('should close by Escape without closing the panel', () => {
        const hint = createHint('текст подсказки');

        document.body.appendChild(hint);
        hint.dispatchEvent(new MouseEvent('mouseenter'));

        const escape = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
        });

        hint.dispatchEvent(escape);

        expect(isVisible(hint)).toBe(false);
        // Esc гасит подсказку, а не панель: тот же Esc не должен доехать до её обработчика
        expect(escape.defaultPrevented).toBe(true);
    });

    it('should hide the previously shown hint', () => {
        // мышь стоит на одной иконке, фокус клавиатурой ушёл на другую - на экране
        // не должно оказаться двух подсказок сразу
        const first = createHint('первая');
        const second = createHint('вторая');

        document.body.appendChild(first);
        document.body.appendChild(second);

        first.dispatchEvent(new MouseEvent('mouseenter'));
        second.dispatchEvent(new FocusEvent('focus'));

        expect(isVisible(first)).toBe(false);
        expect(isVisible(second)).toBe(true);
    });

    it('should not prevent Escape when nothing is shown', () => {
        const hint = createHint('текст подсказки');

        document.body.appendChild(hint);

        const escape = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
        });

        hint.dispatchEvent(escape);

        expect(escape.defaultPrevented).toBe(false);
    });
});
