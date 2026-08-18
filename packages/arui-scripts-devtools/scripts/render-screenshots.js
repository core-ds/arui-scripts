/* eslint-disable */
/**
 * Готовит html для скриншотов расширения в docs/.
 *
 * Панель поднимается тем же кодом, что и в DevTools - из собранного `build/extension/panel.js`,
 * так что скрипт заодно работает смоуком артефакта. Подменены только данные: в кадр должны
 * попасть состояния, которых на живом стенде обычно нет, - ошибка загрузки, незавершённая
 * стадия, расхождение версий в скоупе, событие без слушателей.
 *
 * Время и Resource Timing зафиксированы, поэтому html воспроизводится байт в байт, а скриншоты
 * не «дрожат» между прогонами. А вот png - нет: кодировщик браузера даёт разные байты при
 * одинаковой картинке, так что перегенерация без правок вёрстки добавит в историю
 * бессмысленный бинарный диф.
 *
 * Как обновить картинки - в README, раздел «Как выглядит».
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PKG = path.join(__dirname, '..');
const BUNDLE = path.join(PKG, 'build', 'extension', 'panel.js');
const OUT = process.argv[2] ?? path.join(PKG, 'docs');

if (!fs.existsSync(BUNDLE)) {
    console.error('[render-screenshots] сначала соберите расширение: yarn build');
    process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const NOW = 512;
const TIME_ORIGIN = 1700000000000;
const started = TIME_ORIGIN + 1;

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
global.performance = {
    now: () => NOW,
    timeOrigin: TIME_ORIGIN,
    getEntriesByName: (url) => (RESOURCE_TIMINGS[url] ? [RESOURCE_TIMINGS[url]] : []),
};

const modulesSnapshot = {
    version: 1,
    loads: [
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
    ].map((event, index) => ({ ...event, id: index + 1, timestamp: started + event.time })),
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

/** высоты подобраны так, чтобы кадр обрезался по границе строки, а не посередине */
function write(name, height) {
    // `:host` вне shadow root не матчится ни на что - подменяем его на обёртку кадра
    const styles = shadow.querySelector('style').textContent.replace(/:host\b/g, '.stage');
    const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><style>
body { margin: 0; padding: 24px; background: #eef1f5; }
${styles}
.stage { display: block; width: 920px; height: ${height}px; border-radius: 8px; overflow: hidden; }
</style></head><body><div class="stage">${panelElement().outerHTML}</div></body></html>`;

    fs.writeFileSync(path.join(OUT, `${name}.html`), html);

    return { name, height };
}

async function main() {
    const shots = [];

    await frame();

    // «Модули» с раскрытой удачной загрузкой: водопад всех семи стадий и ресурсы
    toggleRow('Module');
    await frame();
    shots.push(write('panel-modules', 700));
    toggleRow('Module');
    await frame();

    // то же, но с раскрытой ошибкой - ради неё расширение и открывают
    toggleRow('AbstractModule');
    await frame();
    shots.push(write('panel-error', 620));
    toggleRow('AbstractModule');
    await frame();

    activateTab('События');
    await frame();
    shots.push(write('panel-events', 540));

    activateTab('Таймлайн');
    await frame();
    shots.push(write('panel-timeline', 320));

    activateTab('Event bus');
    await frame();
    shots.push(write('panel-event-bus', 380));

    activateTab('Подмена');
    await frame();
    shots.push(write('panel-overrides', 300));

    activateTab('Share scope');
    await frame();
    shots.push(write('panel-share-scope', 600));

    const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const PADDING = 24;

    console.log(`html готовы в ${OUT}. Снять png:\n`);
    shots.forEach(({ name, height }) => {
        console.log(
            `"${CHROME}" --headless --force-device-scale-factor=2 ` +
                `--window-size=968,${height + PADDING * 2} ` +
                `--screenshot="${path.join(OUT, `${name}.png`)}" "${path.join(
                    OUT,
                    `${name}.html`,
                )}"`,
        );
    });

    // панель продолжает опрашивать «страницу» по таймеру и держала бы процесс живым
    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
