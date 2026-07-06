type CacheEntry<T> = {
    status: 'pending' | 'success' | 'error';
    promise: Promise<void>;
    value?: T;
    error?: unknown;
};

// Кеш нужен только чтобы «пережить» пару throw-promise → retry внутри одного рендера
// React (Suspense). После успешного чтения запись удаляется на следующем микротаске,
// поэтому между запросами данные не переиспользуются (важно: moduleState может зависеть
// от запроса). Все чтения в рамках одного синхронного прохода рендера происходят до
// отложенного удаления.
const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Читает значение для Suspense: при первом обращении запускает `load()` и бросает промис
 * (React покажет fallback и повторит рендер после резолва). При повторном обращении
 * возвращает результат или бросает ошибку.
 */
export function readSuspenseResource<T>(key: string, load: () => Promise<T>): T {
    let entry = cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
        const created: CacheEntry<T> = {
            status: 'pending',
            promise: Promise.resolve(),
        };

        created.promise = load().then(
            (value) => {
                created.status = 'success';
                created.value = value;
            },
            (error) => {
                created.status = 'error';
                created.error = error;
            },
        );

        entry = created;
        cache.set(key, entry as CacheEntry<unknown>);
    }

    if (entry.status === 'pending') {
        // бросаем промис — механизм Suspense, а не ошибка
        // eslint-disable-next-line no-throw-literal, @typescript-eslint/no-throw-literal
        throw entry.promise;
    }

    if (entry.status === 'error') {
        cache.delete(key);
        // пробрасываем исходную ошибку загрузки как есть
        // eslint-disable-next-line no-throw-literal, @typescript-eslint/no-throw-literal
        throw entry.error;
    }

    // Успех: отдаём значение и планируем удаление записи после текущего прохода рендера.
    scheduleEviction(key);

    return entry.value as T;
}

function scheduleEviction(key: string) {
    const evict = () => cache.delete(key);

    if (typeof queueMicrotask === 'function') {
        queueMicrotask(evict);
    } else {
        Promise.resolve().then(evict);
    }
}

/** Только для тестов: очистить кеш. */
export function resetSuspenseResourceCache() {
    cache.clear();
}
