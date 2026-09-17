/**
 * Детерминированно сериализует значение в строку со стабильным порядком ключей,
 * чтобы на сервере и на клиенте получался одинаковый `instanceId` для одинаковых
 * `ssrRunParams`.
 */
function stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value) ?? 'undefined';
    }

    if (Array.isArray(value)) {
        return `[${value.map(stableStringify).join(',')}]`;
    }

    const entries = Object.keys(value as Record<string, unknown>)
        .sort()
        .map(
            (key) =>
                `${JSON.stringify(key)}:${stableStringify(
                    (value as Record<string, unknown>)[key],
                )}`,
        );

    return `{${entries.join(',')}}`;
}

/**
 * Возвращает стабильный `instanceId` по умолчанию, вычисленный из `ssrRunParams`.
 * Одинаков на сервере и клиенте, поэтому клиент находит нужный payload и серверную
 * разметку. Если на странице несколько инстансов модуля с одинаковыми `ssrRunParams`,
 * `instanceId` нужно передавать явно (иначе будет коллизия).
 */
export function getDefaultInstanceId(ssrRunParams: unknown): string {
    const json = stableStringify(ssrRunParams);

    // djb2 — простой детерминированный хеш; коллизии допустимы, для них есть явный instanceId
    let hash = 5381;

    for (let i = 0; i < json.length; i += 1) {
        // eslint-disable-next-line no-bitwise
        hash = ((hash << 5) + hash + json.charCodeAt(i)) >>> 0;
    }

    return hash.toString(36);
}
