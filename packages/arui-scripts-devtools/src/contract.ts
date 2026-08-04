/**
 * Копия публичного контракта `globalThis.__ARUI_DEVTOOLS__`, объявленного в `@alfalab/scripts-modules`.
 *
 * Копия, а не импорт: у пакета панели ноль зависимостей, и это осознанно. Панель читает стор,
 * который положила на страницу произвольная (обычно другая) версия загрузчика, поэтому единственный
 * способ договориться — версия контракта, а не общий тип из общего пакета.
 *
 * Здесь только та часть контракта, которая нужна на чтение: внутреннего `writer` тут нет.
 */

/** ключ в globalThis, по которому лежит оболочка devtools */
export const DEVTOOLS_GLOBAL_KEY = '__ARUI_DEVTOOLS__';
/** имя неймспейса загрузчика модулей внутри оболочки */
export const DEVTOOLS_MODULES_NAMESPACE = 'modules';
/** версия оболочки, которую понимает эта панель */
export const SUPPORTED_DEVTOOLS_VERSION = 1;
/** версия контракта неймспейса modules, которую понимает эта панель */
export const SUPPORTED_MODULES_VERSION = 1;
/**
 * Событие на `window`, которым загрузчик сообщает о появлении стора.
 * По нему панель понимает, что на странице действительно грузят модули, и показывает бейдж.
 */
export const DEVTOOLS_READY_EVENT = 'arui:devtools:ready';

export type AruiDevtools = {
    readonly version: number;
    modules?: AruiModulesDevtools;
};

export type AruiModulesDevtools = {
    readonly version: number;
    getSnapshot(): DevtoolsSnapshot;
    subscribe(listener: () => void): () => void;
};

export type DevtoolsSnapshot = {
    version: number;
    loads: ModuleLoadRecord[];
    events: DevtoolsEvent[];
};

export type DevtoolsStage =
    | 'fetch-manifest'
    | 'fetch-resources'
    | 'init-sharing'
    | 'container-init'
    | 'container-get'
    | 'factory'
    | 'compat-get'
    | 'mount';

export type DevtoolsStageTiming = {
    start: number;
    end?: number;
};

export type DevtoolsError = {
    stage: DevtoolsStage;
    message: string;
    stack?: string;
};

export type ModuleLoadRecord = {
    loadId: string;
    moduleId: string;
    hostAppId: string;
    status: 'pending' | 'loaded' | 'error' | 'unmounted';
    containerId?: string;
    moduleVersion?: string;
    mountMode?: 'default' | 'compat';
    shareScope: string;
    baseUrl?: string;
    manifestUrl?: string;
    fromCache: boolean;
    scripts: string[];
    styles: string[];
    mountInstrumented?: boolean;
    timings: Partial<Record<DevtoolsStage, DevtoolsStageTiming>>;
    error?: DevtoolsError;
    startedAt: number;
    finishedAt?: number;
};

export type DevtoolsEventType =
    | 'load-start'
    | 'stage-start'
    | 'stage-end'
    | 'error'
    | 'load-end'
    | 'unmount';

export type DevtoolsEvent = {
    id: number;
    type: DevtoolsEventType;
    loadId: string;
    moduleId: string;
    stage?: DevtoolsStage;
    message?: string;
    timestamp: number;
    time: number;
};
