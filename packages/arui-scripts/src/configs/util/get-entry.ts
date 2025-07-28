export type Entry = string | string[] | Record<string, string | string[]>;

/**
 * @param {string|string[]|object} entryPoint Строка, массив строк или объект с энтрипоинтами
 * @param {Function} getSingleEntry Функция, возвращающая конфигурацию для одного entryPoint
 * @param args Дополнительные аргументы, которые будут переданы в getSingleEntry функцию
 * @returns {*}
 */
export function getEntry<AdditionalArgs extends unknown[]>(
    entryPoint: Entry,
    getSingleEntry: (entry: string[], ...args: AdditionalArgs) => string[],
    ...args: AdditionalArgs
): string[] | Record<string, string | string[]> {
    if (typeof entryPoint === 'string') {
        return getSingleEntry([entryPoint], ...args);
    }
    if (Array.isArray(entryPoint)) {
        return getSingleEntry(entryPoint, ...args);
    }

    // client entry also can be an object, so we must add hot loader to each entry point
    return Object.keys(entryPoint).reduce((result, entryPointName) => {
        const entry = getEntry(entryPoint[entryPointName], getSingleEntry, ...args);

        return {
            ...result,
            [entryPointName]: entry,
        };
    }, {});
}
