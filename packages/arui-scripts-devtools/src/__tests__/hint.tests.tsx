import { fireEvent, render } from '@testing-library/react';

import { Hint } from '../panel/hint';

function getButton(container: HTMLElement) {
    return container.querySelector('.hint') as HTMLButtonElement;
}

function getTooltip(container: HTMLElement) {
    return container.querySelector('.hint__tooltip') as HTMLElement;
}

function isVisible(container: HTMLElement) {
    return getTooltip(container).classList.contains('hint__tooltip_visible');
}

describe('Hint', () => {
    it('should keep the text hidden until asked', () => {
        const { container } = render(<Hint text='Загрузка манифеста провайдера' />);

        expect(getTooltip(container).textContent).toBe('Загрузка манифеста провайдера');
        expect(isVisible(container)).toBe(false);
    });

    it('should be a button a screen reader can announce', () => {
        const { container } = render(<Hint text='текст подсказки' />);
        const button = getButton(container);

        expect(button.tagName).toBe('BUTTON');
        expect(button.getAttribute('type')).toBe('button');
        expect(button.getAttribute('aria-label')).toBeTruthy();
        // подсказку связываем с кнопкой, иначе скринридер прочитает только «кнопка»
        expect(button.getAttribute('aria-describedby')).toBe(getTooltip(container).id);
    });

    it('should show the text on hover and hide it on leave', () => {
        const { container } = render(<Hint text='текст подсказки' />);
        const button = getButton(container);

        fireEvent.mouseOver(button);
        expect(isVisible(container)).toBe(true);

        fireEvent.mouseOut(button);
        expect(isVisible(container)).toBe(false);
    });

    it('should show the text on keyboard focus', () => {
        const { container } = render(<Hint text='текст подсказки' />);
        const button = getButton(container);

        fireEvent.focus(button);
        expect(isVisible(container)).toBe(true);

        fireEvent.blur(button);
        expect(isVisible(container)).toBe(false);
    });

    it('should close by Escape without closing the panel', () => {
        const { container } = render(<Hint text='текст подсказки' />);
        const button = getButton(container);

        fireEvent.mouseOver(button);

        // fireEvent возвращает false, когда обработчик вызвал preventDefault: Esc гасит
        // подсказку и не должен доехать до обработчика панели на document
        const notPrevented = fireEvent.keyDown(button, { key: 'Escape' });

        expect(isVisible(container)).toBe(false);
        expect(notPrevented).toBe(false);
    });

    it('should hide the previously shown hint', () => {
        // мышь стоит на одной иконке, фокус клавиатурой ушёл на другую - на экране
        // не должно оказаться двух подсказок сразу
        const { container } = render(
            <div>
                <Hint text='первая' />
                <Hint text='вторая' />
            </div>,
        );
        const [first, second] = Array.from(container.querySelectorAll('.hint'));
        const [firstTooltip, secondTooltip] = Array.from(
            container.querySelectorAll('.hint__tooltip'),
        );

        fireEvent.mouseOver(first);
        fireEvent.focus(second);

        expect(firstTooltip.classList.contains('hint__tooltip_visible')).toBe(false);
        expect(secondTooltip.classList.contains('hint__tooltip_visible')).toBe(true);
    });

    it('should not prevent Escape when nothing is shown', () => {
        const { container } = render(<Hint text='текст подсказки' />);

        const notPrevented = fireEvent.keyDown(getButton(container), { key: 'Escape' });

        expect(notPrevented).toBe(true);
    });
});
