import { type StackFrame } from '../types';

/**
 * Кадр стека: `at fn (url:line:column)` или голый `at url:line:column`.
 *
 * Разбор нарочно грубый - стек приезжает из чужого рантайма, и единого формата у него нет.
 * Всё, что не распозналось, остаётся текстом: показать кадр важнее, чем сделать его ссылкой.
 */
const FRAME_LOCATION = /(https?:\/\/[^\s()]+?):(\d+):(\d+)/;

/**
 * Разбирает стек на строки, отмечая те, из которых можно открыть код.
 *
 * Ссылками делаем только http(s): `webpack-internal:` и прочие схемы DevTools открыть
 * не сможет, а неработающая ссылка хуже её отсутствия.
 */
export function parseStackFrames(stack: string): StackFrame[] {
    return stack.split('\n').map((text) => {
        const match = FRAME_LOCATION.exec(text);

        if (!match) {
            return { text };
        }

        return {
            text,
            url: match[1],
            // DevTools считает строки с нуля, а рантайм - с единицы
            line: Math.max(Number(match[2]) - 1, 0),
        };
    });
}
