export type CacheEntry<T> = {
    status: 'pending' | 'success' | 'error';
    promise: Promise<void>;
    value?: T;
    error?: unknown;
};

/**
 * Читает значение для Suspense из переданного per-request кэша: при первом обращении
 * запускает `load()` и бросает промис (React покажет fallback и повторит рендер после
 * резолва). При повторном обращении возвращает результат или бросает ошибку.
 *
 * Кэш живёт в рамках одного HTTP-запроса хоста (см. `ModuleSsrRequestProvider`) — между
 * запросами записи не переиспользуются, поэтому `moduleState` одного запроса не может
 * попасть в другой. Eviction: запись удаляется на следующем микротаске после успешного
 * чтения — ровно чтобы пережить пару throw-promise → retry в рамках одного рендера.
 */
export function readSuspenseResource<T>(
    cache: Map<string, CacheEntry<unknown>>,
    key: string,
    load: () => Promise<T>,
): T {
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
    scheduleEviction(cache, key);

    return entry.value as T;
}

function scheduleEviction(cache: Map<string, CacheEntry<unknown>>, key: string) {
    const evict = () => cache.delete(key);

    if (typeof queueMicrotask === 'function') {
        queueMicrotask(evict);
    } else {
        Promise.resolve().then(evict);
    }
}
