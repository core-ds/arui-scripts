/* eslint-disable */
/**
 * Стенд для снимков панели: поднимает собранное расширение в jsdom на подставных данных.
 *
 * Панель здесь та же самая, что в DevTools, - из `build/extension/panel.js`, поэтому стенд
 * заодно работает смоуком артефакта. Подменены только данные: в кадр должны попасть состояния,
 * которых на живом стенде обычно нет, - ошибка загрузки, незавершённая стадия, расхождение
 * версий в скоупе, событие без слушателей, загрузка страницы до перезагрузки.
 *
 * Время, часы и Resource Timing зафиксированы, поэтому html воспроизводится байт в байт.
 * А вот png - нет: кодировщик браузера даёт разные байты при одинаковой картинке, так что
 * перегенерация без правок вёрстки добавит в историю бессмысленный бинарный диф.
 *
 * Пользуются стендом два скрипта: `render-screenshots.js` (картинки для README)
 * и `store-assets.js` (карточка Chrome Web Store).
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PKG = path.join(__dirname, '..');
const BUNDLE = path.join(PKG, 'build', 'extension', 'panel.js');

if (!fs.existsSync(BUNDLE)) {
    console.error('[render-screenshots] сначала соберите расширение: yarn build');
    process.exit(1);
}

// часовой пояс фиксируем: время прошлой загрузки страницы панель показывает по часам,
// и без этого html зависел бы от настроек машины, на которой его собрали
process.env.TZ = 'Europe/Moscow';

const NOW = 512;
const TIME_ORIGIN = 1700000000000;
const started = TIME_ORIGIN + 1;
// прошлая загрузка страницы: стор восстановил её из sessionStorage. Ради этого история
// и нужна - модуль упал на старте, страницу перезагрузили, а запись о падении осталась
const beforeReload = TIME_ORIGIN - 42000;

const RESOURCE_TIMINGS = {
    'http://localhost:8082/assets/remoteEntry.js': { duration: 18, transferSize: 4821 },
    'http://localhost:8082/assets/module.js': { duration: 96, transferSize: 148213 },
    'http://localhost:8082/assets/module.css': { duration: 11, transferSize: 3096 },
};

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost:8080/',
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLInputElement = dom.window.HTMLInputElement;
global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.Event = dom.window.Event;
global.MouseEvent = dom.window.MouseEvent;
global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;
// «сейчас» панель считает по часам страницы: Date.now() минус её начало отсчёта. Без фиксации
// незавершённая стадия дорастала бы до реального текущего времени - и до «87091965 с» на шкале
Date.now = () => TIME_ORIGIN + NOW;

global.performance = {
    now: () => NOW,
    timeOrigin: TIME_ORIGIN,
    getEntriesByName: (url) => (RESOURCE_TIMINGS[url] ? [RESOURCE_TIMINGS[url]] : []),
};

const modulesSnapshot = {
    version: 1,
    loads: [
        {
            loadId: 'before-1',
            moduleId: 'Module',
            hostAppId: 'example',
            status: 'error',
            containerId: 'example_modules',
            shareScope: 'default',
            baseUrl: 'http://localhost:8082',
            manifestUrl: 'http://localhost:8082/assets/webpack-assets.json',
            fromCache: false,
            scripts: [],
            styles: [],
            timings: { 'fetch-manifest': { start: 9, end: 4021 } },
            error: {
                stage: 'fetch-manifest',
                message: 'Failed to fetch http://localhost:8082/assets/webpack-assets.json',
            },
            startedAt: beforeReload,
            finishedAt: beforeReload + 4021,
        },
        {
            loadId: 'load-1',
            moduleId: 'Module',
            hostAppId: 'example',
            status: 'loaded',
            containerId: 'example_modules',
            moduleVersion: '1.1.92',
            mountMode: 'default',
            shareScope: 'default',
            baseUrl: 'http://localhost:8082',
            manifestUrl: 'http://localhost:8082/assets/webpack-assets.json',
            fromCache: false,
            scripts: [
                'http://localhost:8082/assets/remoteEntry.js',
                'http://localhost:8082/assets/module.js',
            ],
            styles: ['http://localhost:8082/assets/module.css'],
            mountInstrumented: true,
            timings: {
                'fetch-manifest': { start: 12, end: 34 },
                'fetch-resources': { start: 34, end: 148 },
                'init-sharing': { start: 148, end: 151 },
                'container-init': { start: 151, end: 153 },
                'container-get': { start: 153, end: 168 },
                factory: { start: 168, end: 172 },
                mount: { start: 174, end: 179 },
            },
            startedAt: started,
            finishedAt: started + 179,
        },
        {
            loadId: 'load-2',
            moduleId: 'CompatModule',
            hostAppId: 'example',
            status: 'loaded',
            containerId: 'example_modules',
            moduleVersion: '1.1.92',
            mountMode: 'compat',
            shareScope: 'default',
            baseUrl: 'http://localhost:8082',
            manifestUrl: 'http://localhost:8082/assets/webpack-assets.json',
            fromCache: true,
            scripts: ['http://localhost:8082/assets/module.js'],
            styles: [],
            // у compat-модуля стадий module federation нет: он берётся из window
            timings: {
                'fetch-manifest': { start: 190, end: 192 },
                'fetch-resources': { start: 192, end: 204 },
                'compat-get': { start: 204, end: 206 },
                mount: { start: 206, end: 210 },
            },
            startedAt: started + 190,
            finishedAt: started + 210,
        },
        {
            loadId: 'load-3',
            moduleId: 'ServerStateModule',
            hostAppId: 'example',
            status: 'pending',
            shareScope: 'default',
            baseUrl: 'http://localhost:8082',
            manifestUrl: 'http://localhost:8082/assets/webpack-assets.json',
            fromCache: false,
            scripts: [],
            styles: [],
            timings: {
                'fetch-manifest': { start: 302, end: 318 },
                'fetch-resources': { start: 318 },
            },
            startedAt: started + 302,
        },
        {
            loadId: 'load-4',
            moduleId: 'AbstractModule',
            hostAppId: 'example',
            status: 'error',
            shareScope: 'default',
            baseUrl: 'http://localhost:8083',
            manifestUrl: 'http://localhost:8083/assets/webpack-assets.json',
            fromCache: false,
            scripts: [],
            styles: [],
            timings: { 'fetch-manifest': { start: 401, end: 428 } },
            error: {
                stage: 'fetch-manifest',
                message:
                    'Не удалось загрузить манифест http://localhost:8083/assets/webpack-assets.json: Failed to fetch',
                stack: [
                    'TypeError: Failed to fetch',
                    '    at fetchAppManifest (http://localhost:8080/assets/main.js:1180:24)',
                    '    at async loadModule (http://localhost:8080/assets/main.js:2041:9)',
                ].join('\n'),
            },
            startedAt: started + 401,
            finishedAt: started + 428,
        },
    ],
    events: [
        {
            type: 'error',
            loadId: 'before-1',
            moduleId: 'Module',
            stage: 'fetch-manifest',
            message: 'Failed to fetch http://localhost:8082/assets/webpack-assets.json',
            timestamp: beforeReload + 4021,
            time: 4030,
        },
        { type: 'load-start', loadId: 'load-1', moduleId: 'Module', time: 12 },
        {
            type: 'stage-start',
            loadId: 'load-1',
            moduleId: 'Module',
            stage: 'fetch-manifest',
            time: 12,
        },
        {
            type: 'stage-end',
            loadId: 'load-1',
            moduleId: 'Module',
            stage: 'fetch-manifest',
            time: 34,
        },
        {
            type: 'stage-start',
            loadId: 'load-1',
            moduleId: 'Module',
            stage: 'fetch-resources',
            time: 34,
        },
        {
            type: 'stage-end',
            loadId: 'load-1',
            moduleId: 'Module',
            stage: 'fetch-resources',
            time: 148,
        },
        {
            type: 'stage-start',
            loadId: 'load-1',
            moduleId: 'Module',
            stage: 'container-get',
            time: 153,
        },
        {
            type: 'stage-end',
            loadId: 'load-1',
            moduleId: 'Module',
            stage: 'container-get',
            time: 168,
        },
        { type: 'load-end', loadId: 'load-1', moduleId: 'Module', time: 179 },
        { type: 'load-start', loadId: 'load-2', moduleId: 'CompatModule', time: 190 },
        { type: 'load-end', loadId: 'load-2', moduleId: 'CompatModule', time: 210 },
        { type: 'load-start', loadId: 'load-3', moduleId: 'ServerStateModule', time: 302 },
        {
            type: 'stage-start',
            loadId: 'load-3',
            moduleId: 'ServerStateModule',
            stage: 'fetch-resources',
            time: 318,
        },
        { type: 'load-start', loadId: 'load-4', moduleId: 'AbstractModule', time: 401 },
        {
            type: 'error',
            loadId: 'load-4',
            moduleId: 'AbstractModule',
            stage: 'fetch-manifest',
            message: 'Не удалось загрузить манифест: Failed to fetch',
            time: 428,
        },
    ].map((event, index) => ({
        // у события прошлой загрузки страницы свой момент: его отсчёт с текущим не связан
        timestamp: started + event.time,
        ...event,
        id: index + 1,
    })),
    // хост и провайдер просят разные мажоры - расхождение, невидимое из самого скоупа
    sharedRequirements: {
        react: [
            { from: 'приложение', requiredVersion: '^18.0.0', eager: true, singleton: true },
            { from: 'example_modules', requiredVersion: '^17.0.0', singleton: true },
        ],
        'react-dom': [
            { from: 'приложение', requiredVersion: '^18.0.0', eager: true, singleton: true },
        ],
    },
    shareScopes: [
        {
            name: 'default',
            packages: [
                {
                    name: 'react',
                    versions: [
                        {
                            version: '18.3.1',
                            from: 'example',
                            loaded: true,
                            eager: true,
                            singleton: true,
                            requiredVersion: '^18.0.0',
                        },
                    ],
                },
                {
                    name: 'react-dom',
                    versions: [
                        {
                            version: '18.3.1',
                            from: 'example',
                            loaded: true,
                            eager: true,
                            singleton: true,
                            requiredVersion: '^18.0.0',
                        },
                    ],
                },
            ],
        },
    ],
};

const busSnapshot = {
    version: 1,
    events: [
        {
            bus: 'example',
            eventName: 'user:login',
            payload: { id: 42, name: 'Иванов' },
            listeners: 2,
            time: 120,
        },
        {
            bus: 'example',
            eventName: 'cart:updated',
            payload: { items: 3 },
            listeners: 1,
            time: 340,
        },
        {
            bus: 'example',
            eventName: 'analytics:page-view',
            payload: { path: '/orders' },
            listeners: 0,
            time: 402,
        },
        { bus: 'module', eventName: 'module:ready', payload: undefined, listeners: 1, time: 455 },
    ].map((event, index) => ({ ...event, id: index + 1, timestamp: started + event.time })),
    listeners: [
        { bus: 'example', eventName: 'user:login', count: 2 },
        { bus: 'example', eventName: 'cart:updated', count: 1 },
        { bus: 'example', eventName: 'theme:changed', count: 1 },
        { bus: 'module', eventName: 'module:ready', count: 1 },
    ],
};

/**
 * Подставной кусок API расширений.
 *
 * `eval` тут не имитация: выражение панели исполняется по-настоящему, просто в контексте
 * подставного `window` - ровно так же, как это делает DevTools на инспектируемой странице.
 */
global.chrome = {
    devtools: {
        inspectedWindow: {
            eval(expression, callback) {
                const pageWindow = {
                    __ARUI_DEVTOOLS__: {
                        version: 1,
                        modules: { version: 1, getSnapshot: () => modulesSnapshot },
                        eventBus: { version: 1, getSnapshot: () => busSnapshot },
                    },
                };
                // eslint-disable-next-line no-new-func
                const result = new Function('window', `return ${expression};`)(pageWindow);

                callback(JSON.parse(JSON.stringify(result)));
            },
        },
        network: { onNavigated: { addListener() {}, removeListener() {} } },
        panels: { create() {}, openResource() {} },
    },
};

// одна подмена уже настроена: пустая вкладка не показывает, ради чего она нужна
dom.window.localStorage.setItem(
    'arui:devtools:overrides',
    JSON.stringify([{ from: 'http://localhost:8082', to: 'http://localhost:8085' }]),
);

require(BUNDLE);

const host =
    dom.window.document.getElementById('arui-devtools-root') ??
    dom.window.document.body.firstElementChild;
const shadow = host.shadowRoot;

/**
 * React коммитит обновления от эффектов и кликов асинхронно, через свой планировщик,
 * поэтому ждём его настоящим таймером. Опрос страницы идёт раз в 500 мс - в это окно
 * мы укладываемся с запасом и лишнего кадра не ловим.
 */
function frame() {
    return new Promise((resolve) => {
        setTimeout(resolve, 50);
    });
}

function panelElement() {
    return shadow.querySelector('.panel');
}

function activateTab(title) {
    const tabs = Array.from(shadow.querySelectorAll('.tab'));
    const tab = tabs.find((item) => item.textContent.indexOf(title) === 0);

    if (!tab) {
        throw new Error(
            `вкладка «${title}» не найдена; есть: ${
                tabs.map((item) => item.textContent).join(', ') || 'ни одной'
            }`,
        );
    }

    tab.click();
}

function toggleRow(moduleId) {
    const rows = Array.from(shadow.querySelectorAll('.row:not(.row_header)'));
    const row = rows.find((item) => item.querySelector('.module-id')?.textContent === moduleId);

    if (!row) {
        const state = shadow.querySelector('.status')?.textContent ?? '';
        const placeholder = shadow.querySelector('.placeholder')?.textContent ?? '';

        throw new Error(
            `строка «${moduleId}» не найдена; строк: ${rows.length}. ${state} ${placeholder}`.trim(),
        );
    }

    row.click();
}

/** стили панели, пригодные вне shadow root: `:host` там не матчится ни на что */
function panelStyles(stageSelector = '.stage') {
    return shadow.querySelector('style').textContent.replace(/:host\b/g, stageSelector);
}

module.exports = { frame, activateTab, toggleRow, panelElement, panelStyles };
