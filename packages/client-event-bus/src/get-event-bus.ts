/**
 * Возвращает event-bus для конкретной системы.
 * Вне browser runtime или до инициализации registry возвращает null.
 * Если registry существует, но шина с таким ключом не создана, возвращает undefined.
 * @param busKey ключ конкретной системы
 */
/* eslint-disable no-underscore-dangle */
export function getEventBus(busKey: string) {
    if (typeof window === 'undefined') {
        return null;
    }

    if (window.__alfa_event_buses) {
        return window.__alfa_event_buses[busKey];
    }

    return null;
}
/* eslint-enable no-underscore-dangle */
