import { type BaseModuleState } from './types';

// Типы для модулей "особого типа", то есть тех, чья форма определена заранее

/**
 * Хелпер для удобного описания типов compat модулей
 * @example (window as WindowWithModule).myAwesomeModule = { ... };
 */
export type WindowWithModule<ModuleType = unknown> = typeof window & {
    [key: string]: ModuleType;
};

// --- Монтируемые модули ---

/** Контекст отдельного запуска. Может отсутствовать в старом хосте. */
export type ModuleLifecycleContext = {
    signal: AbortSignal;
    reportReady(): void;
    reportError(error: unknown): void;
};

export type ModuleLoadErrorStage = 'fetch-manifest' | 'fetch-resources' | 'resolve-export';

export type ModuleMounterErrorStage =
    | ModuleLoadErrorStage
    | 'mount'
    | 'hydrate'
    | 'update'
    | 'runtime'
    | 'ready-timeout'
    | 'unmount';

export type ModuleMounterError = { error: unknown; stage: ModuleMounterErrorStage };

export type ModuleMounterOptions = {
    onReady?: () => void;
    onError?: (event: ModuleMounterError) => void;
    /** Таймаут ожидания explicit-готовности в мс. По умолчанию отключён. */
    readyTimeoutMs?: number;
};

export type ModuleMountFunction<
    RunParams = void,
    ServerState extends BaseModuleState = BaseModuleState,
> = (
    targetNode: HTMLElement,
    runParams: RunParams,
    serverState: ServerState,
    context?: ModuleLifecycleContext,
) => void | Promise<void>;

export type ModuleUnmountFunction = (
    targetNode: HTMLElement,
    context?: ModuleLifecycleContext,
) => void;

/**
 * Специальный тип модуля, который можно монтировать на страницу
 * @template RunParams параметры, которые передаются в модуль с клиента
 * @template ServerState состояние модуля, которое пришло с сервера
 */
export type MountableModule<
    RunParams = void,
    ServerState extends BaseModuleState = BaseModuleState,
> = {
    /** Ожидать reportReady вместо готовности после завершения mount/hydrate. */
    readiness?: 'explicit';
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
     * @param context Контекст снимаемого запуска; позволяет не затронуть другой экземпляр в том же контейнере.
     */
    unmount: ModuleUnmountFunction;
    /**
     * Опциональный метод: модуль должен "оживить" (hydrate) серверную разметку,
     * находящуюся внутри targetNode, вместо её замены.
     * Типичная реализация: ReactDOM.hydrateRoot(targetNode, <Component {...} />).
     *
     * Если метод отсутствует у серверно-отрендеренного модуля — mounter очищает outlet
     * и вызывает `mount()` (корректно, но с визуальным миганием).
     * @param targetNode DOM-нода с серверной разметкой модуля
     * @param runParams параметры, которые передаются в модуль с клиента
     * @param serverState состояние модуля, которое пришло с сервера
     */
    hydrate?: ModuleMountFunction<RunParams, ServerState>;
    /**
     * Опциональный метод: обновить уже смонтированный модуль новыми параметрами
     * без полного перемонтирования (не теряя фокус/состояние DOM).
     * Типичная реализация: root.render(<Component {...newParams} />).
     *
     * Если метод отсутствует — mounter сохраняет текущее поведение с перемонтированием
     * при изменении runParams.
     * @param targetNode DOM-нода, к которой прикреплён модуль
     * @param runParams новые параметры, которые передаются в модуль с клиента
     * @param serverState состояние модуля, которое пришло с сервера
     */
    update?: ModuleMountFunction<RunParams, ServerState>;
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
    // для корректного выведения типов у потребителей нужно использовать именно any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReturnType = any,
    RunParams = void,
    ServerState extends BaseModuleState = BaseModuleState,
> = {
    (runParams: RunParams, serverState: ServerState): ReturnType;
};

export type FactoryModule<
    // для корректного выведения типов у потребителей нужно использовать именно any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReturnType = any,
    RunParams = void,
    ServerState extends BaseModuleState = BaseModuleState,
> =
    | FactoryModuleFunction<ReturnType, RunParams, ServerState>
    | { factory: FactoryModuleFunction<ReturnType, RunParams, ServerState>; mount: never }
    | { mount: FactoryModuleFunction<ReturnType, RunParams, ServerState>; factory: never };

export type WindowWithFactoryModule = WindowWithModule<FactoryModule>;
