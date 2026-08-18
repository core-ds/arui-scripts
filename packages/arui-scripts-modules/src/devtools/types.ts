/**
 * Корень публичного контракта devtools, лежит в `globalThis.__ARUI_DEVTOOLS__`.
 *
 * Это только оболочка: данные лежат в неймспейсах, каждый со своей версией контракта.
 * Сейчас неймспейс один — `modules`, его наполняет загрузчик модулей.
 * Читать всё это может кто угодно: панель `@alfalab/scripts-devtools`, расширение браузера,
 * ваш собственный код мониторинга или просто консоль.
 *
 * Правила для потребителей:
 * - глобала может не быть вовсе, и неймспейса в нём тоже может не быть — обе ситуации нормальные;
 * - обязательно проверяйте `version` (и оболочки, и неймспейса) и деградируйте, если она незнакомая;
 * - в сторе только сериализуемые данные, ссылок на экспорты модулей и DOM-ноды там нет и не будет.
 */
export type AruiDevtools = {
    /** версия оболочки глобала. Меняется только несовместимо */
    readonly version: 1;
    /** неймспейс загрузчика модулей. Появляется при первой попытке загрузить модуль */
    modules?: AruiModulesDevtools;
};

/**
 * Контракт неймспейса `modules`. Версионируется независимо от оболочки.
 */
export type AruiModulesDevtools = {
    /** версия контракта неймспейса. Меняется только несовместимо */
    readonly version: 1;
    /** текущий снимок. Ссылка меняется только когда данные поменялись — можно отдавать в useSyncExternalStore */
    getSnapshot(): DevtoolsSnapshot;
    /** подписка на изменения. Возвращает функцию отписки */
    subscribe(listener: () => void): () => void;
};

export type DevtoolsSnapshot = {
    version: 1;
    /** записи о загрузках модулей, кольцевой буфер */
    loads: ModuleLoadRecord[];
    /** лог событий, кольцевой буфер */
    events: DevtoolsEvent[];
    /**
     * Содержимое share scope на момент последнего события загрузки.
     *
     * Лежит в контракте, потому что достать его снаружи невозможно: `__webpack_share_scopes__` -
     * свободная переменная бандлера, её не видно ни из консоли, ни из расширения браузера.
     * Пересобирается на старте и на завершении каждой загрузки: скоуп меняется именно тогда.
     *
     * Здесь только данные - разбор проблем (несколько версий, разъехавшиеся мажоры singleton)
     * остаётся читателю.
     */
    shareScopes: DevtoolsShareScope[];
    /**
     * Кто и что объявил в `modules.shared`, по пакетам.
     *
     * В рантайме этого нет нигде - скоуп хранит только положенное, - поэтому требования
     * приезжают из сборки: свои подставляет хост, требования провайдеров едут в их манифестах
     * и добавляются, когда загрузчик манифест скачивает. Ради этого видно расхождение
     * «хост просит ^18, провайдер просит ^17», невидимое из самого скоупа.
     *
     * На один пакет требований может быть несколько - по одному на каждого, кто его объявил.
     */
    sharedRequirements: Record<string, DevtoolsSharedRequirement[]>;
};

export type DevtoolsSharedRequirement = {
    /** кто объявил: имя приложения-хоста или контейнера провайдера */
    from: string;
    requiredVersion?: string;
    singleton?: boolean;
    strictVersion?: boolean;
    eager?: boolean;
};

export type DevtoolsShareScope = {
    /** имя скоупа, обычно `default` */
    name: string;
    packages: DevtoolsSharedPackage[];
};

export type DevtoolsSharedPackage = {
    name: string;
    versions: DevtoolsSharedVersion[];
};

export type DevtoolsSharedVersion = {
    version: string;
    /** имя контейнера, который положил эту версию в скоуп */
    from?: string;
    /** модуль уже исполнен и отдан потребителю */
    loaded: boolean;
    eager?: boolean;
    singleton?: boolean;
    /** диапазон, который потребовал тот, кто положил запись. Требования остальных сюда не попадают */
    requiredVersion?: string;
    strictVersion?: boolean;
};

/**
 * Стадии загрузки модуля, по которым пишутся тайминги и ошибки.
 *
 * Четыре стадии module federation - init-sharing, container-init, container-get и factory -
 * есть только у модулей в режиме default. У compat-модулей вместо них одна compat-get:
 * получение глобала модуля из window.
 */
export type DevtoolsStage =
    | 'fetch-manifest'
    | 'fetch-resources'
    | 'init-sharing'
    | 'container-init'
    | 'container-get'
    | 'factory'
    | 'compat-get'
    | 'mount';

/**
 * Репортёр стадий, который загрузчик протаскивает в свои внутренние функции.
 * Нужен там, где стадия начинается и заканчивается не в теле самого загрузчика.
 */
export type DevtoolsStageTrace = {
    start(stage: DevtoolsStage): void;
    end(stage: DevtoolsStage): void;
};

export type DevtoolsStageTiming = {
    /** performance.now() на начало стадии */
    start: number;
    /** performance.now() на конец стадии. Отсутствует, если стадия не завершилась */
    end?: number;
};

export type DevtoolsError = {
    /** стадия, на которой всё сломалось */
    stage: DevtoolsStage;
    message: string;
    stack?: string;
};

export type ModuleLoadRecord = {
    /** уникален на каждую попытку загрузки, в том числе на повторную загрузку того же модуля */
    loadId: string;
    moduleId: string;
    hostAppId: string;
    status: 'pending' | 'loaded' | 'error' | 'unmounted';
    /** имя module-federation контейнера в window (он же appName из манифеста) */
    containerId?: string;
    moduleVersion?: string;
    mountMode?: 'default' | 'compat';
    shareScope: string;
    /** эффективный baseUrl, уже после всех подмен */
    baseUrl?: string;
    /** url манифеста, если модуль грузился через него */
    manifestUrl?: string;
    /** ресурсы были взяты из кеша загрузчика, сетевого запроса не было */
    fromCache: boolean;
    /** абсолютные url скриптов модуля. По ним можно достать Resource Timing */
    scripts: string[];
    /** абсолютные url стилей модуля */
    styles: string[];
    /**
     * Стадию `mount` удалось обернуть замером. Загрузчик умеет это только для модулей,
     * которые уже на этом этапе выглядят как монтируемые; остальные разворачиваются позже,
     * и для них отсутствие `timings.mount` означает «не измерено», а не «мгновенно».
     */
    mountInstrumented?: boolean;
    timings: Partial<Record<DevtoolsStage, DevtoolsStageTiming>>;
    error?: DevtoolsError;
    /** Date.now() на начало загрузки */
    startedAt: number;
    /** Date.now() на момент перехода в финальный статус */
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
    /** порядковый номер события, растёт монотонно в пределах одной загрузки страницы */
    id: number;
    type: DevtoolsEventType;
    loadId: string;
    moduleId: string;
    stage?: DevtoolsStage;
    message?: string;
    /** Date.now() */
    timestamp: number;
    /** performance.now() */
    time: number;
};
