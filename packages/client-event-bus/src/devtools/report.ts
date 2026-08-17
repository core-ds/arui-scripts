import { serializePayload } from './serialize';
import { getEventBusDevtoolsStore } from './store';

/**
 * Всё, что делает сборщик, обёрнуто в этот хелпер: диагностика не имеет права сломать
 * отправку события ни при каких обстоятельствах.
 */
function safe(run: () => void): void {
    try {
        run();
    } catch {
        // молчим: приложению от нашей поломки хуже быть не должно
    }
}

function now(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
}

/**
 * Подписка добавлена.
 *
 * Считать их приходится самим: EventTarget слушателей не показывает, а вопрос «событие ушло,
 * почему никто не отреагировал» - основной для этой вкладки.
 */
export function reportListenerAdded(bus: string, eventName: string): void {
    safe(() => {
        getEventBusDevtoolsStore()?.writer.addListener(bus, eventName);
    });
}

export function reportListenerRemoved(bus: string, eventName: string): void {
    safe(() => {
        getEventBusDevtoolsStore()?.writer.removeListener(bus, eventName);
    });
}

/** Событие отправлено в шину */
export function reportDispatch(bus: string, eventName: string, payload: unknown): void {
    safe(() => {
        const store = getEventBusDevtoolsStore();

        if (!store) {
            return;
        }

        const { value, omitted } = serializePayload(payload);

        store.writer.addEvent({
            bus,
            eventName,
            payload: value,
            payloadOmitted: omitted || undefined,
            timestamp: Date.now(),
            time: now(),
        });
    });
}
