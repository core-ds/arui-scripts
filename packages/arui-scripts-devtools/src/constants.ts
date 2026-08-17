import {
    type DevtoolsStage,
    type ModuleLoadRecord,
    type PanelState,
    type PanelTabDefinition,
} from './types';

/*
 * Все константы пакета в одном файле. Css-строки констант не считаются и живут рядом
 * со своим потребителем (styles.css у панели, BADGE_STYLES у бейджа).
 *
 * Файл импортируется и eager-частью (install, badge), поэтому здесь не может быть
 * ничего, кроме значений: любой импорт кода утащил бы его в основной бандл приложений.
 */

/* ------------------------------ контракт глобала ---------------------------- */

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

/* -------------------------------- включение -------------------------------- */

/** ключ в localStorage, которым панель включают руками - в том числе в прод-сборке на стенде */
export const DEVTOOLS_ENABLED_KEY = 'arui:devtools';

export const ENABLED_VALUES = ['1', 'true', 'on'];
export const DISABLED_VALUES = ['0', 'false', 'off'];

/* --------------------------------- данные ---------------------------------- */

/**
 * Как часто перепроверяем появление стора, пока его нет.
 * Неймспейс `modules` создаётся при первой попытке загрузить модуль, а она может случиться
 * сильно позже открытия панели - например, по клику пользователя.
 */
export const STORE_POLL_INTERVAL = 500;

/* ----------------------------------- DOM ----------------------------------- */

/** id хост-элемента панели в светлом DOM. Внутри него - shadow root, снаружи не видно ничего */
export const DEVTOOLS_ROOT_ID = 'arui-devtools-root';

/** id хост-элемента бейджа в светлом DOM */
export const DEVTOOLS_BADGE_ID = 'arui-devtools-badge';

/* ------------------------------ состояние панели ---------------------------- */

/**
 * Ключ, под которым панель помнит саму себя.
 *
 * Именно sessionStorage: панель открывают, чтобы разобраться с конкретной страницей, и после
 * перезагрузки она должна остаться открытой в этой вкладке - но не всплывать во всех остальных.
 */
export const PANEL_STATE_KEY = 'arui:devtools:panel';

export const DEFAULT_PANEL_STATE: PanelState = { open: false };

/** вкладки панели в порядке отображения; первая - вкладка по умолчанию */
export const PANEL_TABS: readonly PanelTabDefinition[] = [
    { id: 'modules', title: 'Модули' },
    { id: 'events', title: 'События' },
    { id: 'share-scope', title: 'Share scope' },
];

/* ------------------------------- отображение -------------------------------- */

/** прочерк вместо пустого места: так видно, что данных нет, а не что колонка съехала */
export const EMPTY = '—';

export const STATUS_LABELS: Record<ModuleLoadRecord['status'], string> = {
    pending: 'грузится',
    loaded: 'загружен',
    error: 'ошибка',
    unmounted: 'размонтирован',
};

export const LOADS_TABLE_COLUMNS = [
    'Статус',
    'Модуль',
    'Версия',
    'Container',
    'baseUrl',
    'Режим',
    'Время',
];

export const EVENTS_COLUMNS = ['Время', 'Событие', 'Модуль', 'Стадия', 'Сообщение'];

/** отступ подсказки от края экрана и от самой иконки, px */
export const HINT_GAP = 8;

/* --------------------------------- водопад --------------------------------- */

/** порядок стадий в водопаде - тот же, в котором их проходит загрузчик */
export const STAGE_ORDER: DevtoolsStage[] = [
    'fetch-manifest',
    'fetch-resources',
    'init-sharing',
    'container-init',
    'container-get',
    'factory',
    // заменяет собой четыре стадии module federation у compat-модулей
    'compat-get',
    'mount',
];

/**
 * Что происходит на каждой стадии.
 *
 * Названия - внутренняя терминология загрузчика, по ним не догадаешься, а половина стадий
 * приходит из module federation. Показываем подсказкой на названии: она не занимает места
 * в и без того плотном водопаде и не может быть обрезана краем панели, в отличие от всплывашки
 * своей вёрстки.
 */
export const STAGE_HINTS: Record<DevtoolsStage, string> = {
    'fetch-manifest':
        'Загрузка манифеста провайдера (webpack-assets.json): из него берутся адреса скриптов и стилей модуля.',
    'fetch-resources':
        'Скрипты и стили модуля вставляются в документ, загрузчик ждёт, пока браузер их загрузит.',
    'init-sharing':
        '__webpack_init_sharing__: приложение-хост кладёт свои общие библиотеки в share scope, чтобы модуль мог взять их оттуда.',
    'container-init':
        'container.init(): контейнер провайдера получает share scope и добавляет туда свои версии библиотек.',
    'container-get': 'container.get(): у контейнера запрашивается фабрика нужного модуля.',
    factory: 'Вызов фабрики: код модуля исполняется и отдаёт свои экспорты.',
    'compat-get':
        'Compat-модуль берётся из window: его скрипт при загрузке сам положил туда свой глобал.',
    mount: 'Вызов mount() у модуля: модуль рисует себя в переданный элемент.',
};

/** минимальная ширина полоски, %: стадия, уложившаяся в один тик, тоже должна быть видна */
export const MIN_BAR_WIDTH = 1;

/** как часто дорисовывается водопад, пока в нём висит незавершённая стадия, мс */
export const PENDING_TICK_INTERVAL = 500;
