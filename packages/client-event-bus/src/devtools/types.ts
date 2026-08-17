/**
 * Контракт неймспейса `eventBus` в `globalThis.__ARUI_DEVTOOLS__`.
 *
 * Оболочка та же, что у загрузчика модулей, и версионируется отдельно: неймспейсы наполняют
 * разные пакеты, которые друг о друге ничего не знают и обновляются независимо.
 *
 * Правила для читателей те же: глобала может не быть, неймспейса тоже, версию проверять
 * обязательно, в сторе только сериализуемые данные.
 */
export type AruiEventBusDevtools = {
    /** версия контракта неймспейса. Меняется только несовместимо */
    readonly version: 1;
    getSnapshot(): EventBusSnapshot;
    subscribe(listener: () => void): () => void;
};

export type EventBusSnapshot = {
    version: 1;
    /** отправленные события, кольцевой буфер */
    events: EventBusEventRecord[];
    /** сколько слушателей сейчас висит на каждом событии, по шинам */
    listeners: EventBusListenerCount[];
};

export type EventBusEventRecord = {
    /** порядковый номер, растёт монотонно в пределах загрузки страницы */
    id: number;
    /** ключ шины: их на странице может быть несколько */
    bus: string;
    eventName: string;
    /**
     * Полезная нагрузка, приведённая к сериализуемому виду. В шину кладут что угодно -
     * DOM-ноды, функции, циклические структуры, - а контракт обещает читателям только данные.
     */
    payload: unknown;
    /** нагрузку не удалось сериализовать; в payload лежит описание вместо значения */
    payloadOmitted?: boolean;
    /** сколько слушателей получили это событие в момент отправки */
    listeners: number;
    /** Date.now() */
    timestamp: number;
    /** performance.now() */
    time: number;
};

export type EventBusListenerCount = {
    bus: string;
    eventName: string;
    count: number;
};
