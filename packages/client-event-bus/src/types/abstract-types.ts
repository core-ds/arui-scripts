/**
 * Общий тип для событий. Не должен использоваться напрямую
 */
export type AbstractKnownEventTypes = {
    [key: string]: unknown;
};

/**
 * Общий event-bus для всех приложений. Все взаимодействие между приложениями может происходить
 * только через него. Помимо стандартного функционала event-emitter умеет так же хранить и возвращать
 * последнее значение любого события. Это может быть полезно когда приложение только отобразилось
 * и хочет понять текущее состояние.
 */
export interface AbstractAppEventBus<KnownEventTypes extends AbstractKnownEventTypes> {
    /**
     * Подписаться на событие
     * @param eventName название события
     * @param eventHandler обработчик события
     * @param options дополнительные настройки листенера
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     */
    addEventListener<EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName]>(
        eventName: EventName,
        eventHandler: (event: CustomEvent<PayloadType>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;

    /**
     * Возвращает последние данные события. Если событие еще не происходило - возвращает undefined.
     * @param eventName название события
     */
    getLastEventDetail<EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName]>(
        eventName: EventName,
    ): PayloadType | undefined;

    /**
     * Подписаться на событие и получить последний event события.
     * Фактически объединяет в себе addEventListener и getLastEventDetail.
     * @param eventName название события
     * @param eventHandler обработчик события
     * @param options дополнительные настройки листенера
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     */
    addEventListenerAndGetLast<EventName extends keyof KnownEventTypes, PayloadType extends KnownEventTypes[EventName]>(
        eventName: EventName,
        eventHandler: (event: CustomEvent<PayloadType>) => void,
        options?: boolean | AddEventListenerOptions,
    ): PayloadType | undefined;

    /**
     * Удаляет подписку конкретного обработчика на событие
     * @param eventName название события
     * @param eventHandler обработчик события
     * @param options дополнительные настройки листенера
     * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
     */
    removeEventListener<EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName],
    >(
        eventName: EventName,
        eventHandler: (event: CustomEvent<PayloadType>) => void,
        options?: EventListenerOptions | boolean,
    ): void;

    /**
     * Публикует событие
     * @param eventName название события
     * @param event payload события
     */
    dispatchEvent<EventName extends keyof KnownEventTypes,
        PayloadType extends KnownEventTypes[EventName]>(
        eventName: EventName,
        event?: PayloadType,
    ): void;
}
