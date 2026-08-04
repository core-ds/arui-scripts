import { getDevtoolsModulesStore } from './store';
import {
    type DevtoolsError,
    type DevtoolsEventType,
    type DevtoolsStage,
    type DevtoolsStageTrace,
    type ModuleLoadRecord,
} from './types';

/**
 * Всё, что делает сборщик, обёрнуто в этот хелпер.
 * Сборщик диагностики не имеет права уронить загрузку модуля ни при каких обстоятельствах.
 */
function safe<R>(fn: () => R): R | undefined {
    try {
        return fn();
    } catch {
        return undefined;
    }
}

function now(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
}

/** поля записи, которые загрузчик имеет право дописать по ходу загрузки */
const UPDATABLE_KEYS = [
    'containerId',
    'moduleVersion',
    'mountMode',
    'baseUrl',
    'manifestUrl',
    'fromCache',
    'scripts',
    'styles',
    'mountInstrumented',
] as const;

export type ModuleLoadUpdate = Partial<Pick<ModuleLoadRecord, (typeof UPDATABLE_KEYS)[number]>>;

/**
 * Копирует из патча только известные поля. Защита от того, чтобы в стор случайно
 * не утекли ссылки на экспорты модуля, DOM-ноды или что-то ещё несериализуемое.
 */
function pickUpdate(update: ModuleLoadUpdate): ModuleLoadUpdate {
    const result: Record<string, unknown> = {};

    UPDATABLE_KEYS.forEach((key) => {
        if (update[key] !== undefined) {
            result[key] = update[key];
        }
    });

    return result as ModuleLoadUpdate;
}

function serializeError(stage: DevtoolsStage, error: unknown): DevtoolsError {
    if (error instanceof Error) {
        return { stage, message: error.message, stack: error.stack };
    }

    if (typeof error === 'string') {
        return { stage, message: error };
    }

    try {
        return { stage, message: String(error) };
    } catch {
        return { stage, message: 'Unknown error' };
    }
}

function pushEvent(
    loadId: string,
    type: DevtoolsEventType,
    extra?: { stage?: DevtoolsStage; message?: string },
) {
    const store = getDevtoolsModulesStore();

    if (!store) {
        return;
    }

    store.writer.addEvent({
        type,
        loadId,
        moduleId: store.writer.getLoad(loadId)?.moduleId ?? '',
        stage: extra?.stage,
        message: extra?.message,
        timestamp: Date.now(),
        time: now(),
    });
}

export type ModuleLoadStartInfo = {
    moduleId: string;
    hostAppId: string;
    shareScope: string;
};

/**
 * Начало попытки загрузки модуля. Возвращает loadId, который нужно передавать
 * во все остальные вызовы. `undefined` означает, что стор недоступен —
 * все последующие вызовы с ним просто ничего не сделают.
 */
export function reportLoadStart(info: ModuleLoadStartInfo): string | undefined {
    return safe(() => {
        const store = getDevtoolsModulesStore();

        if (!store) {
            return undefined;
        }

        const loadId = store.writer.nextLoadId();

        store.writer.addLoad({
            loadId,
            moduleId: info.moduleId,
            hostAppId: info.hostAppId,
            shareScope: info.shareScope,
            status: 'pending',
            fromCache: false,
            scripts: [],
            styles: [],
            timings: {},
            startedAt: Date.now(),
        });

        pushEvent(loadId, 'load-start');

        return loadId;
    });
}

/** Дописать в запись то, что стало известно по ходу загрузки */
export function reportLoadUpdate(loadId: string | undefined, update: ModuleLoadUpdate) {
    if (!loadId) {
        return;
    }

    safe(() => {
        const patch = pickUpdate(update);

        getDevtoolsModulesStore()?.writer.updateLoad(loadId, (record) => ({ ...record, ...patch }));
    });
}

export function reportStageStart(loadId: string | undefined, stage: DevtoolsStage) {
    if (!loadId) {
        return;
    }

    safe(() => {
        getDevtoolsModulesStore()?.writer.updateLoad(loadId, (record) => ({
            ...record,
            timings: { ...record.timings, [stage]: { start: now() } },
        }));

        pushEvent(loadId, 'stage-start', { stage });
    });
}

export function reportStageEnd(loadId: string | undefined, stage: DevtoolsStage) {
    if (!loadId) {
        return;
    }

    safe(() => {
        getDevtoolsModulesStore()?.writer.updateLoad(loadId, (record) => {
            const timing = record.timings[stage];

            return {
                ...record,
                timings: {
                    ...record.timings,
                    [stage]: { start: timing?.start ?? now(), end: now() },
                },
            };
        });

        pushEvent(loadId, 'stage-end', { stage });
    });
}

/**
 * Ошибка на стадии. Переводит запись в статус `error` и закрывает стадию,
 * если та была открыта.
 */
export function reportLoadError(loadId: string | undefined, stage: DevtoolsStage, error: unknown) {
    if (!loadId) {
        return;
    }

    safe(() => {
        const serialized = serializeError(stage, error);

        getDevtoolsModulesStore()?.writer.updateLoad(loadId, (record) => {
            const timing = record.timings[stage];

            return {
                ...record,
                status: 'error',
                error: serialized,
                timings: timing
                    ? { ...record.timings, [stage]: { ...timing, end: now() } }
                    : record.timings,
                finishedAt: Date.now(),
            };
        });

        pushEvent(loadId, 'error', { stage, message: serialized.message });
    });
}

/** Модуль успешно загрузился и отдан приложению */
export function reportLoadSuccess(loadId: string | undefined) {
    if (!loadId) {
        return;
    }

    safe(() => {
        getDevtoolsModulesStore()?.writer.updateLoad(loadId, (record) => ({
            ...record,
            // Ошибку и размонтирование не затираем успехом: «unmounted» до конца загрузки
            // означает прерывание по abortSignal — ресурсы уже сняты со страницы, и «loaded»
            // в записи было бы враньём, хотя сама загрузка и дошла до конца.
            status:
                record.status === 'error' || record.status === 'unmounted'
                    ? record.status
                    : 'loaded',
            finishedAt: Date.now(),
        }));

        pushEvent(loadId, 'load-end');
    });
}

export type ModuleStageTracker = DevtoolsStageTrace & {
    /** последняя начатая стадия. По ней понятно, где именно всё сломалось */
    readonly current: DevtoolsStage;
};

/**
 * Репортёр стадий для внутренних функций загрузчика. Помимо записи таймингов
 * запоминает последнюю начатую стадию, чтобы загрузчик мог отнести ошибку к ней.
 */
export function createStageTracker(
    loadId: string | undefined,
    initialStage: DevtoolsStage,
): ModuleStageTracker {
    let current = initialStage;

    return {
        get current() {
            return current;
        },
        start(stage) {
            current = stage;
            reportStageStart(loadId, stage);
        },
        end(stage) {
            reportStageEnd(loadId, stage);
        },
    };
}

/** Ресурсы модуля сняты со страницы */
export function reportUnmount(loadId: string | undefined) {
    if (!loadId) {
        return;
    }

    safe(() => {
        getDevtoolsModulesStore()?.writer.updateLoad(loadId, (record) => ({
            ...record,
            status: 'unmounted',
        }));

        pushEvent(loadId, 'unmount');
    });
}
