import { isEscapeFromFilledInput } from '../utils/escape-from-input';

/** событие с подменённым composedPath: так его видит слушатель на document */
function createEvent(target: EventTarget | null, path?: EventTarget[]): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });

    Object.defineProperty(event, 'target', { value: target });

    if (path) {
        Object.defineProperty(event, 'composedPath', { value: () => path });
    }

    return event;
}

describe('isEscapeFromFilledInput', () => {
    it('should be true for a filled input', () => {
        const input = document.createElement('input');

        input.value = 'react';

        expect(isEscapeFromFilledInput(createEvent(input, [input]))).toBe(true);
    });

    it('should be false for an empty input', () => {
        const input = document.createElement('input');

        expect(isEscapeFromFilledInput(createEvent(input, [input]))).toBe(false);
    });

    it('should be true for a filled textarea', () => {
        const textarea = document.createElement('textarea');

        textarea.value = 'что-то';

        expect(isEscapeFromFilledInput(createEvent(textarea, [textarea]))).toBe(true);
    });

    it('should be false for anything that is not a text field', () => {
        const button = document.createElement('button');

        expect(isEscapeFromFilledInput(createEvent(button, [button]))).toBe(false);
    });

    it('should look at the real target inside a shadow root, not at the host', () => {
        // событие из shadow root приходит на document ретаргетенным на хост-элемент,
        // и по target панель приняла бы поле ввода за обычный div
        const host = document.createElement('div');
        const input = document.createElement('input');

        input.value = 'react';

        expect(isEscapeFromFilledInput(createEvent(host, [input, host]))).toBe(true);
    });

    it('should fall back to target when composedPath is not available', () => {
        // старые браузеры и часть синтетических событий про composedPath не знают
        const input = document.createElement('input');
        const event = createEvent(input);

        input.value = 'react';
        Object.defineProperty(event, 'composedPath', { value: undefined });

        expect(isEscapeFromFilledInput(event)).toBe(true);
    });

    it('should survive an event without a target at all', () => {
        expect(isEscapeFromFilledInput(createEvent(null, []))).toBe(false);
    });
});
