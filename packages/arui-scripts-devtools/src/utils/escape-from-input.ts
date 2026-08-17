/**
 * Пришёл ли Esc из непустого поля ввода панели.
 *
 * Слушаем мы на `document`, а событие из shadow root туда приходит ретаргетенным на хост-элемент -
 * настоящую цель видно только в `composedPath`.
 */
export function isEscapeFromFilledInput(event: KeyboardEvent): boolean {
    const target = (
        typeof event.composedPath === 'function' ? event.composedPath()[0] : event.target
    ) as HTMLElement | null;

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return target.value !== '';
    }

    return false;
}
