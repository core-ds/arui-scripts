export const getModuleResourcesPath = 'api/getModuleResources';

/**
 * Базовый запрос к ручке для получения информации о модуле
 */
export interface GetResourcesRequest<Params = Record<string, unknown>> {
    /** идентификатор запрашиваемого модуля. */
    moduleId: string;
    /**
     * Идентификатор приложения, которое может загружать модули.
     * В формате {system-name}-{package.json.name}
     * @example 'nib-corp-shared-ui'
     **/
    hostAppId: string;
    /** Дополнительные параметры, которые могут понадобиться определенному виду приложений при загрузке */
    params?: Params;
}

/**
 * То, как подключать модуль на страницу.
 * embedded - режим подключения без использования module-federation. В этом случае мы сами подключаем все скрипты и стили.
 * mf - module-federation режим, загрузкой скриптов и стилей занимается wepack.
 */
export type MountMode = 'embedded' | 'mf';

/**
 * Базовые параметры запуска модуля на странице
 */
export type BaseModuleParams = {
    /** Предзагруженное состояние модуля, будет передано в mountFunction */
    preloadedState?: unknown;
    /**
     * Базовый адрес загружаемого модуля.
     * Он может быть как относительным, так и абсолютным.
     * Это свойство должно называться baseUrl, но оставлено в таком виде для совместимости с module-loader корпоратов
     * @example https://foo.bar.com, /foo/bar
     **/
    contextRoot: string;
};

/**
 * Ответ от ручки с информацией о загружаемом модуле
 */
export interface GetResourcesResponse<
    ModuleParams extends BaseModuleParams = BaseModuleParams,
> {
    /** пути до js скриптов модуля */
    scripts: string[];
    /** пути до css стилей модуля */
    styles: string[];
    /** версия модуля */
    moduleVersion: string;
    /** название приложения, которое предоставляет модуль */
    appName: string;
    /** то, как подключать модуль на страницу. Базово предполагается только один режим. Но он может расширятся */
    mountMode: MountMode;
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
    hostAppId: string;
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
        moduleId: string,
        moduleParams: ResourcesResponse,
    ) => Promise<void>;
    /**
     * Функция, которая будет вызвана после получения ответа от getResources для преобразования параметров (GetResourcesResponse.moduleParams) в формат нужный для работы конкретного модуля
     */
    getModuleRunParams?: (
        moduleId: string,
        moduleParams: ResourcesResponse
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
    /** id модуля */
    moduleId: string,
    /**  */
    params: Params,
    targetNode?: HTMLElement,
) => ModuleMountFunctionResult;

export type ModuleUnmountFunction = (targetNode?: HTMLElement) => void;

export type MountableModule = {
    mount: ModuleMountFunction;
    unmount: ModuleUnmountFunction;
};

export type WindowWithMountableModule = typeof window & {
    [key: string]: MountableModule | undefined;
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

declare global {
    /* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle */
    const __webpack_init_sharing__: Function;
    const __webpack_share_scopes__: {
        default: unknown;
    };
    /* eslint-enable @typescript-eslint/naming-convention,no-underscore-dangle */
}
