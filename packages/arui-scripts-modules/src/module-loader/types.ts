/**
 * То, как подключать модуль на страницу.
 * embedded - режим подключения без использования module-federation. В этом случае мы сами подключаем все скрипты и стили.
 * mf - module-federation режим, загрузкой скриптов и стилей занимается wepack.
 */
export type MountMode = 'embedded' | 'mf';

/**
 * Запрос, который будет отправлен на сервер для получения ресурсов модуля
 */
export type GetResourcesRequest<GetResourcesParams = void> = {
    /** id загружаемого модуля */
    moduleId: string;
    /** id приложения-хоста */
    hostAppId: string;
    /** параметры, которые передаются в функцию получения ресурсов модуля */
    params: GetResourcesParams,
};

/**
 * Клиентский манифест приложения. Генерируется во время сборки.
 */
export type AruiAppManifest = {
    [moduleId: string]: {
        js?: string;
        css?: string;
    }
} & { // мы делаем так, поскольку typescript не позволяет определить доп поля другого типа
    __metadata__: {
        version: string;
        name: string;
    };
}
/**
 * "состояние" модуля полученное от сервера
 */
export type BaseModuleState = {
    baseUrl: string;
};
/**
 * Ресурсы, которые нужны модулю для запуска
 */
export type ModuleResources<ModuleState extends BaseModuleState = BaseModuleState> = {
    /** пути до js скриптов модуля */
    scripts: string[];
    /** пути до css стилей модуля */
    styles: string[];
    /** версия модуля */
    moduleVersion: string;
    /** название приложения, которое предоставляет модуль */
    appName: string;
    /** то, как подключать модуль на страницу. */
    mountMode: MountMode;
    /** предподготовленное "состояние" модуля, которое он получит при монтировании на страницу */
    moduleState: ModuleState;
};

type LoaderResult<ModuleExportType> = {
    unmount: () => void;
    module: ModuleExportType;
    moduleResources: ModuleResources;
}

// Для того чтобы пользователям не приходилось передавать undefined если их загрузчик не принимает параметры
// мы делаем такой мини-хак
export type LoaderParams<GetResourcesParams> = {
    getResourcesParams: GetResourcesParams;
};

/**
 * Функция, которая загружает модуль и подключает его на страницу.
 * Может принимать дополнительные параметры, которые будут переданы в функцию получения ресурсов модуля.
 * Возвращает промис, содержащий сам модуль и функцию, которая удаляет ресурсы модуля со страницы.
 */
export type Loader<GetResourcesParams, ModuleExportType = unknown> =
    (params: LoaderParams<GetResourcesParams>) => Promise<LoaderResult<ModuleExportType>>;

// Описание типов модулей

export type ModuleMountFunction<RunParams = void, ServerState extends BaseModuleState = BaseModuleState> =
    (targetNode: HTMLElement, runParams: RunParams, serverState: ServerState) => void;

export type ModuleUnmountFunction = (targetNode: HTMLElement) => void;

// Специальный тип модуля, который можно монтировать на страницу
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
 * Хелпер для удобного описания типов embeded модулей
 * @example (window as WindowWithModule).myAwesomeModule = { ... };
 */
export type WindowWithModule<ModuleType = unknown> = typeof window & {
    [key: string]: ModuleType;
}

/**
 * Хелпер для удобного описания embeded модулей
 */
export type WindowWithMountableModule = WindowWithModule<MountableModule>

export type ModuleFederationContainer = {
    init: (...args: unknown[]) => Promise<void>;
    get<T>(id: string): Promise<() => T>;
};


declare global {
    /* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle */
    const __webpack_init_sharing__: Function;
    const __webpack_share_scopes__: {
        default: unknown;
    };
    /* eslint-enable @typescript-eslint/naming-convention,no-underscore-dangle */
}
