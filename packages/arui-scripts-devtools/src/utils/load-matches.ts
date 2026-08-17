import { STATUS_LABELS } from '../constants';
import { type ModuleLoadRecord } from '../types';

/**
 * Попадает ли запись под текстовый фильтр таблицы.
 *
 * Ищем по всему, что видно в строке, включая подпись статуса: пользователь набирает «ошибка»,
 * а не `error`, и ожидает, что это сработает.
 */
export function matchesLoad(record: ModuleLoadRecord, query: string): boolean {
    if (!query) {
        return true;
    }

    return [
        record.moduleId,
        record.containerId,
        record.moduleVersion,
        record.baseUrl,
        record.mountMode,
        record.hostAppId,
        STATUS_LABELS[record.status],
        record.error?.message,
    ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
}
