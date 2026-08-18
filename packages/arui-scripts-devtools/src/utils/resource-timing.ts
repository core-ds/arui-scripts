import { type ResourceTiming } from '../types';

/**
 * Достаёт данные Resource Timing по абсолютному url ресурса.
 *
 * Записи копятся в буфере браузера и могут вытесняться, поэтому «нет записи» - обычное дело,
 * а не признак того, что ресурс не грузился.
 */
export function readResourceTiming(url: string): ResourceTiming | undefined {
    try {
        if (typeof performance === 'undefined' || !performance.getEntriesByName) {
            return undefined;
        }

        const entries = performance.getEntriesByName(
            url,
            'resource',
        ) as PerformanceResourceTiming[];
        // при повторной загрузке модуля записей несколько, интересна последняя
        const entry = entries[entries.length - 1];

        if (!entry) {
            return undefined;
        }

        return {
            duration: entry.duration,
            // Для кросс-доменных ресурсов браузер зануляет transferSize, пока провайдер не отдаст
            // заголовок Timing-Allow-Origin. Ноль здесь означает «браузер не сказал», а не «0 байт»,
            // поэтому наружу отдаём undefined - рисовать «0 КБ» было бы враньём.
            transferSize: entry.transferSize > 0 ? entry.transferSize : undefined,
        };
    } catch {
        return undefined;
    }
}
