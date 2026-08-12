
// Ключ localStorage, в котором хранятся значение такого формата { "moduleId": "http://localhost:8080" }
export const MODULE_OVERRIDES_STORAGE_KEY = 'arui:module-overrides';

export const MODULE_OVERRIDES_ENV_KEY = 'ARUI_MODULE_OVERRIDES';

type Overrides = Record<string, string>;

function parseOverrides(rawValue: string | undefined | null, source: string): Overrides {
    if (!rawValue) {
        return {};
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(rawValue);
    } catch {
        // eslint-disable-next-line no-console -- битая конфигурация не должна ронять приложение, но и молчать о ней нельзя
        console.warn(
            `[arui-modules] Не удалось разобрать подмены модулей из ${source}, они будут проигнорированы.`,
            rawValue,
        );

        return {};
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        // eslint-disable-next-line no-console -- см. комментарий выше
        console.warn(
            `[arui-modules] Подмены модулей из ${source} должны быть json-объектом вида {"moduleId":"http://localhost:8081"}, они будут проигнорированы.`,
            rawValue,
        );

        return {};
    }

    const result: Overrides = {};

    Object.entries(parsed as Record<string, unknown>).forEach(([moduleId, baseUrl]) => {
        if (typeof baseUrl === 'string' && baseUrl) {
            result[moduleId] = baseUrl;
        }
    });

    return result;
}

function readFromStorage(): Overrides {
    try {
        return parseOverrides(
            window.localStorage.getItem(MODULE_OVERRIDES_STORAGE_KEY),
            `localStorage["${MODULE_OVERRIDES_STORAGE_KEY}"]`,
        );
    } catch {
        // localStorage может быть недоступен (приватный режим, отключенные куки) - это не повод падать
        return {};
    }
}

function readFromEnv(): Overrides {
    // Обращение к process.env.ARUI_MODULE_OVERRIDES должно быть записано литералом:
    // именно эту строку DefinePlugin заменяет на значение при сборке.
    return parseOverrides(
        process.env.ARUI_MODULE_OVERRIDES,
        `process.env.${MODULE_OVERRIDES_ENV_KEY}`,
    );
}

/**
 * Возвращает dev-подмену базового адреса приложения, предоставляющего модуль.
 *
 * Подмены нужны для локальной разработки модуля вместе с приложением-потребителем: модуль поднимается
 * локально, а хост грузит его с localhost вместо стенда.
 *
 * В production-сборке функция всегда возвращает undefined, а все чтение конфигурации вырезается
 * минификатором. Это принципиально: возможность подменить источник исполняемого js в проде -
 * это возможность выполнить произвольный код на странице приложения.
 *
 * @param moduleId id модуля, для которого ищется подмена
 */
export function getModuleOverride(moduleId: string): string | undefined {
    if (process.env.NODE_ENV === 'production') {
        return undefined;
    }

    const overrides = { ...readFromEnv(), ...readFromStorage() };
    const baseUrl = overrides[moduleId];

    if (!baseUrl) {
        return undefined;
    }

    // eslint-disable-next-line no-console -- без этого предупреждения разработчики часами ищут, почему модуль "не обновляется"
    console.warn(
        `[arui-modules] Для модуля "${moduleId}" включена dev-подмена адреса. Модуль будет загружен с`,
        baseUrl,
    );

    return baseUrl;
}
