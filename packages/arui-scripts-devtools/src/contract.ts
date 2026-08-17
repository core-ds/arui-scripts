/**
 * Публичный контракт `globalThis.__ARUI_DEVTOOLS__` на чтение.
 *
 * Файл оставлен точкой входа для читателей контракта: типы живут в `types.ts`, константы -
 * в `constants.ts`, а здесь только реэкспорт той их части, которая и есть контракт.
 */
export {
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    DEVTOOLS_READY_EVENT,
    SUPPORTED_DEVTOOLS_VERSION,
    SUPPORTED_MODULES_VERSION,
} from './constants';
export type {
    AruiDevtools,
    AruiModulesDevtools,
    DevtoolsError,
    DevtoolsEvent,
    DevtoolsEventType,
    DevtoolsSnapshot,
    DevtoolsStage,
    DevtoolsStageTiming,
    GlobalWithDevtools,
    ModuleLoadRecord,
} from './types';
