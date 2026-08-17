import { HINT_GAP } from '../constants';

/**
 * Координаты подсказки: над иконкой, если сверху есть место, и не выезжая за края экрана.
 * Подсказка позиционируется `fixed`, поэтому координаты - относительно вьюпорта.
 */
export function getHintPosition(anchor: DOMRect, own: DOMRect) {
    const above = anchor.top - own.height - HINT_GAP;
    const centered = anchor.left + anchor.width / 2 - own.width / 2;
    const maxLeft = document.documentElement.clientWidth - own.width - HINT_GAP;

    return {
        top: above >= HINT_GAP ? above : anchor.bottom + HINT_GAP,
        left: Math.max(HINT_GAP, Math.min(centered, maxLeft)),
    };
}
