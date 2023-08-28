import { BaseModuleState } from './types';

// Типы для модулей "особого типа", то есть тех, чья форма определена заранее

/**
 * Хелпер для удобного описания типов compat модулей
 * @example (window as WindowWithModule).myAwesomeModule = { ... };
 */
export type WindowWithModule<ModuleType = unknown> = typeof window & {
    [key: string]: ModuleType;
}

// --- Монтируемые модули ---

export type ModuleMountFunction<RunParams = void, ServerState extends BaseModuleState = BaseModuleState> =
    (targetNode: HTMLElement, runParams: RunParams, serverState: ServerState) => void;

export type ModuleUnmountFunction = (targetNode: HTMLElement) => void;

/**
 * Специальный тип модуля, который можно монтировать на страницу
 * @template RunParams параметры, которые передаются в модуль с клиента
 * @template ServerState состояние модуля, которое пришло с сервера
 */
export type MountableModule<RunParams = void, ServerState extends BaseModuleState = BaseModuleState> = {
    /**
     * Метод, с помощью которого модуль может прикрепиться к DOM
     * @param targetNode DOM-нода, к которой нужно прикрепить модуль
     * @param runParams параметры, которые передаются в модуль с клиента
     * @param serverState состояние модуля, которое пришло с сервера
     */
    mount: ModuleMountFunction<RunParams, ServerState>;
    /**
     * Метод, с помощью которого модуль должен открепиться от DOM
     * @param targetNode DOM-нода, от которой нужно открепить модуль
     */
    unmount: ModuleUnmountFunction;
};

/**
 * Хелпер для удобного описания mountable compat модулей
 */
export type WindowWithMountableModule = WindowWithModule<MountableModule>;

// --- Модули-фабрики ---

/**
 * Специальный тип модуля, который является фабрикой
 * @template ServerState состояние модуля, которое пришло с сервера
 * @template RunParams параметры, которые передаются в модуль с клиента
 * @template ReturnType тип, который возвращает фабрика
 */
export type FactoryModuleFunction<
    ReturnType = any,
    RunParams = void,
    ServerState extends BaseModuleState = BaseModuleState,
> = {
    (runParams: RunParams, serverState: ServerState): ReturnType;
};

export type FactoryModule<ReturnType = any, RunParams = void, ServerState extends BaseModuleState = BaseModuleState> =
    | FactoryModuleFunction<ReturnType, RunParams, ServerState>
    | { factory: FactoryModuleFunction<ReturnType, RunParams, ServerState> };

export type WindowWithFactoryModule = WindowWithModule<FactoryModule>;
