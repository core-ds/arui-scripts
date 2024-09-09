/**
 * Возвращает event-bus для конкретной системы. Если event-bus в текущем контексте не доступен - вернет undefined
 * @param busKey ключ конкретной системы
 */
/* eslint-disable no-underscore-dangle */
export function getEventBus(busKey: string) {
    if (window.__alfa_event_buses) {
        return window.__alfa_event_buses[busKey];
    }

    return null;
}
/* eslint-enable no-underscore-dangle */
