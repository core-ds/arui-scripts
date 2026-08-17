import { OVERRIDES_STORAGE_KEY } from '../constants';
import { type Override } from '../extension/overrides';

/**
 * Подмены помнятся между открытиями DevTools.
 *
 * Именно localStorage документа расширения: правила declarativeNetRequest живут в сессии
 * браузера и переживают закрытие DevTools, а вот список в интерфейсе - нет. Без этого
 * при следующем открытии панель показывала бы пустую вкладку, пока подмены работают.
 */
function getStorage(): Storage | undefined {
    try {
        return typeof localStorage === 'undefined' ? undefined : localStorage;
    } catch {
        return undefined;
    }
}

function isOverride(value: unknown): value is Override {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const { from, to } = value as { from?: unknown; to?: unknown };

    return typeof from === 'string' && typeof to === 'string';
}

export function readOverrides(): Override[] {
    const storage = getStorage();

    if (!storage) {
        return [];
    }

    try {
        const raw = storage.getItem(OVERRIDES_STORAGE_KEY);

        if (!raw) {
            return [];
        }

        const parsed: unknown = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed.filter(isOverride) : [];
    } catch {
        // мусор в хранилище не должен мешать вкладке открыться
        return [];
    }
}

export function writeOverrides(overrides: Override[]): void {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    try {
        storage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
    } catch {
        // квота или запрет на запись - подмены просто не вспомнятся, это не повод падать
    }
}
