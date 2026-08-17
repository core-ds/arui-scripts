import { HINT_GAP } from '../constants';
import { getHintPosition } from '../utils/hint-position';

/** DOMRect в jsdom не конструируется из литерала, а нам нужны только эти поля */
function rect(partial: Partial<DOMRect>): DOMRect {
    return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0, ...partial } as DOMRect;
}

describe('getHintPosition', () => {
    const { clientWidth } = document.documentElement;

    function setViewportWidth(width: number) {
        Object.defineProperty(document.documentElement, 'clientWidth', {
            value: width,
            configurable: true,
        });
    }

    afterEach(() => {
        setViewportWidth(clientWidth);
    });

    it('should put the tooltip above the icon when there is room', () => {
        setViewportWidth(1000);

        const position = getHintPosition(
            rect({ top: 200, bottom: 216, left: 500, width: 16 }),
            rect({ width: 200, height: 60 }),
        );

        expect(position.top).toBe(200 - 60 - HINT_GAP);
        // по центру иконки: 500 + 8 - 100
        expect(position.left).toBe(408);
    });

    it('should drop the tooltip below the icon when there is no room above', () => {
        setViewportWidth(1000);

        const position = getHintPosition(
            rect({ top: 4, bottom: 20, left: 500, width: 16 }),
            rect({ width: 200, height: 60 }),
        );

        expect(position.top).toBe(20 + HINT_GAP);
    });

    it('should not let the tooltip run off the left edge', () => {
        setViewportWidth(1000);

        const position = getHintPosition(
            rect({ top: 200, bottom: 216, left: 0, width: 16 }),
            rect({ width: 200, height: 60 }),
        );

        expect(position.left).toBe(HINT_GAP);
    });

    it('should not let the tooltip run off the right edge', () => {
        setViewportWidth(1000);

        const position = getHintPosition(
            rect({ top: 200, bottom: 216, left: 990, width: 16 }),
            rect({ width: 200, height: 60 }),
        );

        expect(position.left).toBe(1000 - 200 - HINT_GAP);
    });

    it('should prefer the left edge when the tooltip is wider than the viewport', () => {
        // окно уже подсказки: правый край считается отрицательным, но выезжать влево хуже -
        // начало текста должно остаться видимым
        setViewportWidth(100);

        const position = getHintPosition(
            rect({ top: 200, bottom: 216, left: 10, width: 16 }),
            rect({ width: 300, height: 60 }),
        );

        expect(position.left).toBe(HINT_GAP);
    });
});
