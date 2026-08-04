import {
    type DevtoolsEvent,
    type DevtoolsSnapshot,
    type DevtoolsStage,
    type DevtoolsStageTiming,
    type ModuleLoadRecord,
} from './types';

/** ключ в sessionStorage, в котором дублируется содержимое неймспейса modules */
export const DEVTOOLS_STORAGE_KEY = 'arui:devtools:modules';

/** размер кольцевого буфера записей о загрузках */
export const LOADS_LIMIT = 50;
/** размер кольцевого буфера событий */
export const EVENTS_LIMIT = 300;

function getSessionStorage(): Storage | undefined {
    try {
        // в node и в приватных режимах некоторых браузеров обращение к sessionStorage кидает
        return typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
    } catch {
        return undefined;
    }
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function toStringArray(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : [];
}

/**
 * Приводит тайминги к контракту, выбрасывая всё, на чём читатель споткнётся.
 *
 * `start` обязателен и должен быть числом: панель считает по нему длительности и рисует
 * водопад, а `Math.min` от строки или undefined даёт NaN во всю ширину экрана.
 */
function normalizeTimings(value: unknown): Partial<Record<DevtoolsStage, DevtoolsStageTiming>> {
    if (!isObject(value)) {
        return {};
    }

    const result: Record<string, DevtoolsStageTiming> = {};

    Object.keys(value).forEach((stage) => {
        const timing = value[stage];

        if (!isObject(timing) || typeof timing.start !== 'number') {
            return;
        }

        result[stage] = {
            start: timing.start,
            ...(typeof timing.end === 'number' ? { end: timing.end } : {}),
        };
    });

    return result;
}

/**
 * Восстанавливает запись из sessionStorage.
 *
 * Не просто проверяет, а достраивает: в хранилище мог попасть снимок от другой сборки,
 * его мог поправить руками человек, а мог обрезать переполненный квотой браузер. Читателю
 * при этом обещан полный контракт — пусть недостающее лучше будет пустым, чем отсутствующим.
 * Записи без опознавательных знаков отбрасываем: склеивать их не с чем.
 */
function restoreRecord(value: unknown): ModuleLoadRecord | undefined {
    if (
        !isObject(value) ||
        typeof value.loadId !== 'string' ||
        typeof value.moduleId !== 'string'
    ) {
        return undefined;
    }

    return {
        ...(value as unknown as ModuleLoadRecord),
        status:
            typeof value.status === 'string'
                ? (value.status as ModuleLoadRecord['status'])
                : 'pending',
        shareScope: typeof value.shareScope === 'string' ? value.shareScope : 'default',
        hostAppId: typeof value.hostAppId === 'string' ? value.hostAppId : '',
        fromCache: value.fromCache === true,
        startedAt: typeof value.startedAt === 'number' ? value.startedAt : 0,
        scripts: toStringArray(value.scripts),
        styles: toStringArray(value.styles),
        timings: normalizeTimings(value.timings),
    };
}

/**
 * Восстанавливает событие из sessionStorage — по тем же правилам, что и запись.
 *
 * Опознавательные знаки — `type`, `loadId` и числовой `id` — обязательны. `id` в их числе
 * не случайно: стор продолжает нумерацию от id последнего восстановленного события, и строка
 * на этом месте превратила бы `id + 1` в конкатенацию — контракт `id: number` сломался бы
 * у всех событий текущей загрузки. `Number.isFinite` не лишний: JSON.parse умеет отдать
 * Infinity из `1e999`. Остальные поля достраиваем значениями, на которых читатель не споткнётся.
 */
function restoreEvent(value: unknown): DevtoolsEvent | undefined {
    if (
        !isObject(value) ||
        typeof value.type !== 'string' ||
        typeof value.loadId !== 'string' ||
        typeof value.id !== 'number' ||
        !Number.isFinite(value.id)
    ) {
        return undefined;
    }

    return {
        ...(value as unknown as DevtoolsEvent),
        moduleId: typeof value.moduleId === 'string' ? value.moduleId : '',
        stage: typeof value.stage === 'string' ? (value.stage as DevtoolsStage) : undefined,
        message: typeof value.message === 'string' ? value.message : undefined,
        timestamp: typeof value.timestamp === 'number' ? value.timestamp : 0,
        time: typeof value.time === 'number' ? value.time : 0,
    };
}

/**
 * Читает снимок прошлой загрузки страницы. Любая поломка тут означает пустой стор,
 * а не сломанную загрузку модуля.
 */
export function restoreSnapshot(version: number): {
    loads: ModuleLoadRecord[];
    events: DevtoolsEvent[];
} {
    const empty = { loads: [], events: [] };
    const storage = getSessionStorage();

    if (!storage) {
        return empty;
    }

    try {
        const raw = storage.getItem(DEVTOOLS_STORAGE_KEY);

        if (!raw) {
            return empty;
        }

        const parsed = JSON.parse(raw) as Partial<DevtoolsSnapshot>;

        if (parsed?.version !== version) {
            return empty;
        }

        return {
            loads: (Array.isArray(parsed.loads) ? parsed.loads : [])
                .map(restoreRecord)
                .filter((record): record is ModuleLoadRecord => record !== undefined)
                .slice(-LOADS_LIMIT),
            events: (Array.isArray(parsed.events) ? parsed.events : [])
                .map(restoreEvent)
                .filter((event): event is DevtoolsEvent => event !== undefined)
                .slice(-EVENTS_LIMIT),
        };
    } catch {
        return empty;
    }
}

/** Складывает снимок в sessionStorage. Не смогли - значит не смогли, стор в памяти важнее. */
export function persistSnapshot(snapshot: DevtoolsSnapshot) {
    const storage = getSessionStorage();

    if (!storage) {
        return;
    }

    try {
        storage.setItem(DEVTOOLS_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
        // квота кончилась или запись запрещена — молча живём дальше
    }
}
