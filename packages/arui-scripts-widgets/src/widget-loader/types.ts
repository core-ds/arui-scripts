/**
 * Идентификатор приложения, которое может загружать модули.
 * В формате {system-name}-{package.json.name}, например nib-corp-shared-ui
 */
export type HostAppId = string;

/**
 * Базовый запрос к ручке для получения информации о модуле
 */
export interface GetResourcesRequest<Params = Record<string, unknown>> {
    /** идентификатор запрашиваемого модуля. На случай, если приложение хочет предоставлять несколько модулей */
    moduleId: string;
    /** id приложения, которое хочет загрузить модуль */
    hostAppId: HostAppId;
    /** Дополнительные параметры, которые могут понадобится определенному виду приложений при загрузке */
    params?: Params;
}

/**
 * То, как подключать модуль на страницу.
 * embedded - режим подключения для старых проектов, которые не используют module-federation. В таком режиме мы сами обрабатываем загрузку скриптов
 * mf - module-federation режим, загрузкой скриптов и стилей занимается вебпак.
 * Локально режимы могут быть расширены
 */
export type BaseMountMode = 'embedded' | 'mf' | string;

/**
 * Базовые параметры запуска модуля на странице
 */
export type BaseModuleParams = {
    /** Предзагруженное состояние модуля, будет передано в mountFunction */
    preloadedState?: unknown;
    /** Базовый адрес загружаемого модуля. Это свойство должно называться baseUrl, но оставлено в таком виде для совместимости с module-loader корпоратов */
    contextRoot: string;
};

/**
 * Ответ от ручки с информацией о загружаемом модуле
 */
export interface GetResourcesResponse<
    ModuleParams extends BaseModuleParams = BaseModuleParams,
    MountMode extends BaseMountMode = BaseMountMode,
> {
    /** пути до js скриптов модуля */
    scripts: string[];
    /** пути до css стилей модуля */
    styles: string[];
    /** версия модуля */
    moduleVersion: string;
    /** то, как подключать модуль на страницу. Базово предполагается только один режим. Но он может расширятся */
    mountMode: MountMode;
    /** название функции, которую надо будет дернуть чтобы запустить приложение */
    mountFunctionName: string;
    /** название функции, которую надо будет дернуть при удалении модуля из dom */
    unmountFunctionName?: string;
    /** кастомные параметры, которые должны быть использованы при вызове mount функции */
    moduleRunParams: ModuleParams;
}

/**
  * Параметры, настраивающие загрузчик
  */
export type CreateLoaderParams<
    ResourcesRequest extends GetResourcesRequest,
    ResourcesResponse extends GetResourcesResponse,
> = {
    /** Идентификатор приложения, которое будет загружать модули. */
    hostAppId: HostAppId;
    /**
     * Функция, которая будет вызвана для формирования параметров обращения к getResources
     */
    getModuleRequestParams?: (moduleId: string) => Promise<ResourcesRequest['params']>;
    /**
     * Функция-фетчер, которая должна обращаться к ручке getResources. По какой логике она будет формировать запрос к нему - это ее дело
     */
    fetchFunction: (params: ResourcesRequest) => Promise<ResourcesResponse>;
    /**
     * Функция, которая будет вызвана перед подключением ресурсов приложения на страницу
     */
    onBeforeResourcesMount?: (
        moduleId: string, moduleParams: ResourcesResponse
    ) => Promise<void>;
    /**
     * Функция, которая будет вызвана после получения ответа от getResources для преобразования параметров (GetResourcesResponse.moduleParams) в формат, который нужен для работы конкретного модуля
     */
    getModuleRunParams?: (
        moduleId: string, moduleParams: ResourcesResponse
    ) => Promise<BaseModuleParams>;
    /**
     * Функция, которая будет вызвана перед запуском кода модуля
     */
    onBeforeModuleMount?: (
        moduleId: string, moduleParams: ResourcesResponse, targetNode?: HTMLElement,
    ) => void;
    /**
     * Функция, которая будет вызвана сразу после запуска кода модуля
     */
    onAfterModuleMount?: (moduleId: string, moduleParams: ResourcesResponse) => void;
    /**
     * Функция, которая будут вызвана при анмаунте модуля
     * Она не может быть асинхронной, так как может быть использована прямо перед уничтожением целевого элемента
     */
    onBeforeModuleUnmount?: (
        moduleId: string, moduleParams: ResourcesResponse, targetNode?: HTMLElement,
    ) => void;
};

/**
 * Функция, которая возвращается из загрузчика, и позволяет отмонтировать приложение
 */
export type UnmountFunction = () => void;

/**
 * Основная функция загрузчика
 */
export type LoaderFunction<ResultType = ReturnType<ModuleMountFunction>> = (
    moduleId: string, // id загружаемого модуля
    targetNode?: HTMLElement, // html элемент, в который должен примонтироваться модуль
) => { unmount: UnmountFunction; result: Promise<ResultType> };

export type ModuleMountFunction<
    Params extends BaseModuleParams = BaseModuleParams,
    ModuleMountFunctionResult = any,
> = (
    moduleId: string,
    params: Params,
    targetNode?: HTMLElement,
) => ModuleMountFunctionResult;

export type ModuleUnmountFunction = (targetNode?: HTMLElement) => void;

/**
 * Хелпер, добавляющий в window функцию для маунта модуля
 */
export type WindowWithMountFunction = typeof window & {
    [key: string]: ModuleMountFunction | undefined;
};

/**
 * Хелпер, добавляющий в wincow функцию для анмаунта модуля
 */
export type WindowWithUnmountFunction = typeof window & {
    [key: string]: ModuleUnmountFunction | undefined;
};

export type LoadingState = 'unknown' | 'pending' | 'rejected' | 'fulfilled';

export type SyncPreload<P, R = Record<string, unknown>> = (parameter: P) => R;

export type AsyncPreload<P, R = Record<string, unknown>> = (parameter: P) => Promise<R>;

export interface BaseModuleRunParams {
    preloadedState: Record<string, unknown>;
    contextRoot: string;
}

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
