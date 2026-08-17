import { type ReactNode } from 'react';

/*
 * Все типы пакета в одном файле. Первая половина - копия публичного контракта
 * `globalThis.__ARUI_DEVTOOLS__`, объявленного в `@alfalab/scripts-modules`.
 *
 * Копия, а не импорт: у пакета панели ноль зависимостей, и это осознанно. Панель читает стор,
 * который положила на страницу произвольная (обычно другая) версия загрузчика, поэтому
 * единственный способ договориться - версия контракта, а не общий тип из общего пакета.
 * Здесь только та часть контракта, которая нужна на чтение: внутреннего `writer` тут нет.
 */

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

/** глобальный объект вместе с оболочкой devtools, если загрузчик её уже положил */
export type GlobalWithDevtools = typeof globalThis & {
    __ARUI_DEVTOOLS__?: AruiDevtools;
};

/* ------------------------------- share scope ------------------------------- */

export type SharedVersion = {
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

export type ShareProblemType = 'multiple-versions' | 'singleton-major-mismatch';

export type ShareProblem = {
    type: ShareProblemType;
    message: string;
};

export type SharedPackage = {
    name: string;
    versions: SharedVersion[];
    problems: ShareProblem[];
};

export type ShareScope = {
    name: string;
    packages: SharedPackage[];
};

export type RawShareConfig = {
    singleton?: boolean;
    requiredVersion?: string | false;
    strictVersion?: boolean;
    eager?: boolean;
};

export type RawSharedItem = {
    loaded?: unknown;
    eager?: unknown;
    from?: unknown;
    shareConfig?: RawShareConfig;
};

/* ------------------------------ состояние стора ----------------------------- */

export type ModulesStoreState =
    /** стор на странице есть, версия понятная */
    | { status: 'ready'; snapshot: DevtoolsSnapshot }
    /** стора пока нет: либо загрузчик не подключён, либо ни один модуль ещё не грузился */
    | { status: 'waiting' }
    /** стор есть, но его версия новее или старше той, что мы умеем читать */
    | { status: 'unsupported'; found: number; supported: number };

/* ------------------------------- панель и UI ------------------------------- */

export type PanelState = {
    /** панель была открыта в момент ухода со страницы */
    open: boolean;
    /** id последней активной вкладки */
    tab?: string;
};

export type ResourceTiming = {
    /** сколько заняла загрузка ресурса, мс */
    duration: number;
    /**
     * сколько байт реально приехало по сети.
     * Отсутствует, когда браузер отказался это сообщать - см. `readResourceTiming`
     */
    transferSize?: number;
};

export type MountDevtoolsOptions = {
    /** куда монтировать хост панели. По умолчанию - `document.body` */
    container?: HTMLElement;
    /** вызывается, когда панель закрыли изнутри: крестиком или по Esc */
    onClose?(): void;
};

export type PanelTabId = 'modules' | 'events' | 'share-scope';

export type PanelTabDefinition = {
    id: PanelTabId;
    title: string;
};

export type PanelAppProps = {
    /** вызывается крестиком; Esc обрабатывает mount - он живёт на document за пределами дерева */
    onClose(): void;
};

export type PanelBodyProps = {
    state: ModulesStoreState;
    activeTab: PanelTabId;
    scopes: ShareScope[];
    expandedLoads: ReadonlySet<string>;
    onToggleLoad(loadId: string): void;
    eventsQuery: string;
    onEventsQueryChange(query: string): void;
    eventsOnlyErrors: boolean;
    onEventsOnlyErrorsChange(onlyErrors: boolean): void;
};

export type PanelErrorBoundaryProps = {
    /**
     * Смена ключа сбрасывает ошибку и пробует отрисовать содержимое заново.
     * Панель передаёт сюда состояние стора: следующая нотификация - следующая попытка.
     */
    resetKey: unknown;
    children: ReactNode;
};

export type PanelErrorBoundaryState = {
    failed: boolean;
    resetKey: unknown;
};

export type LoadsTableProps = {
    loads: ModuleLoadRecord[];
    /** loadId раскрытых строк. Состояние держит панель, чтобы оно переживало переключение вкладок */
    expanded: ReadonlySet<string>;
    onToggle(loadId: string): void;
};

export type LoadDetailsProps = {
    record: ModuleLoadRecord;
};

export type WaterfallProps = {
    record: ModuleLoadRecord;
};

export type EventsViewProps = {
    events: DevtoolsEvent[];
    /** фильтры контролирует панель: значения должны переживать переключение вкладок */
    query: string;
    onQueryChange(query: string): void;
    onlyErrors: boolean;
    onOnlyErrorsChange(onlyErrors: boolean): void;
};

export type ShareScopeViewProps = {
    /** снимок скоупов собирает панель: он должен обновляться и по нотификациям стора */
    scopes: ShareScope[];
};

export type HintProps = {
    /** что показать */
    text: string;
    /** чем кнопку назовёт скринридер */
    label?: string;
};
