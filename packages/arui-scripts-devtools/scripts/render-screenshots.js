/* eslint-disable */
/**
 * Готовит html для скриншотов панели в docs/.
 *
 * Панель собирается тем же кодом, что и в браузере, - подменены только данные, чтобы в кадр
 * попали состояния, которых в примере обычно нет: незавершённая загрузка, ошибка, расхождение
 * версий в share scope. Время и Resource Timing зафиксированы, поэтому html воспроизводится
 * байт в байт, а скриншоты не «дрожат» между прогонами.
 *
 * Как обновить картинки - в README, раздел «Как выглядит».
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const PKG = path.join(__dirname, '..');
const OUT = process.argv[2] ?? path.join(PKG, 'docs');

fs.mkdirSync(OUT, { recursive: true });

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost:8080/',
});

const NOW = 512;
const TIME_ORIGIN = 1700000000000;

const RESOURCE_TIMINGS = {
    'http://localhost:8082/assets/remoteEntry.js': { duration: 18, transferSize: 4821 },
    'http://localhost:8082/assets/module.js': { duration: 96, transferSize: 148213 },
    'http://localhost:8082/assets/module.css': { duration: 11, transferSize: 3096 },
};

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLInputElement = dom.window.HTMLInputElement;
global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
global.sessionStorage = dom.window.sessionStorage;
global.localStorage = dom.window.localStorage;
global.performance = {
    now: () => NOW,
    timeOrigin: TIME_ORIGIN,
    getEntriesByName: (url) => (RESOURCE_TIMINGS[url] ? [RESOURCE_TIMINGS[url]] : []),
};

// share scope с расхождением версий - панель обязана показать проблему
global.__webpack_share_scopes__ = {
    default: {
        react: {
            '18.3.1': {
                from: 'example',
                loaded: 1,
                shareConfig: { singleton: true, requiredVersion: '^18.0.0', eager: true },
            },
            '17.0.2': {
                from: 'example_modules',
                loaded: 0,
                shareConfig: { singleton: true, requiredVersion: '^17.0.0' },
            },
        },
        'react-dom': {
            '18.3.1': {
                from: 'example',
                loaded: 1,
                shareConfig: { singleton: true, requiredVersion: '^18.0.0', eager: true },
            },
        },
    },
};

const { createPanel } = require(path.join(PKG, 'build/ui/panel.js'));
const { PANEL_STYLES } = require(path.join(PKG, 'build/ui/styles.js'));

const started = TIME_ORIGIN + 1;

const loads = [
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
        finishedAt: started + 167,
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
        // у compat-модуля стадий module federation нет: он берётся из window,
        // а не через container.get()
        timings: {
            'fetch-manifest': { start: 190, end: 192 },
            'fetch-resources': { start: 192, end: 204 },
            mount: { start: 204, end: 208 },
        },
        startedAt: started + 190,
        finishedAt: started + 208,
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
            stack: 'TypeError: Failed to fetch\n    at fetchManifest (create-module-loader.ts:118:24)\n    at async loadModule (create-module-loader.ts:204:9)',
        },
        startedAt: started + 401,
        finishedAt: started + 428,
    },
];

const events = [
    { type: 'load-start', loadId: 'load-1', moduleId: 'Module', time: 12 },
    {
        type: 'stage-start',
        loadId: 'load-1',
        moduleId: 'Module',
        stage: 'fetch-manifest',
        time: 12,
    },
    { type: 'stage-end', loadId: 'load-1', moduleId: 'Module', stage: 'fetch-manifest', time: 34 },
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
    { type: 'stage-end', loadId: 'load-1', moduleId: 'Module', stage: 'container-get', time: 168 },
    { type: 'load-end', loadId: 'load-1', moduleId: 'Module', time: 179 },
    { type: 'load-start', loadId: 'load-2', moduleId: 'CompatModule', time: 190 },
    { type: 'load-end', loadId: 'load-2', moduleId: 'CompatModule', time: 208 },
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
].map((event, index) => ({ ...event, id: index + 1, timestamp: TIME_ORIGIN + 1 + event.time }));

const panel = createPanel({ onClose: () => undefined });

panel.update({ status: 'ready', snapshot: { version: 1, loads, events } });

function activateTab(title) {
    const tab = Array.from(panel.element.querySelectorAll('.tab')).find(
        (item) => item.textContent.indexOf(title) === 0,
    );

    tab.click();
}

/** высоты подобраны так, чтобы кадр обрезался по границе строки, а не посередине */
function write(name, height) {
    const styles = PANEL_STYLES.replace(':host', '.stage').replace('all: initial;', '');
    const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><style>
body { margin: 0; padding: 24px; background: #eef1f5; }
${styles}
.stage { display: block; width: 880px; height: ${height}px; }
.panel { position: static; width: 100%; height: 100%; max-width: none; max-height: none; }
</style></head><body><div class="stage">${panel.element.outerHTML}</div></body></html>`;

    fs.writeFileSync(path.join(OUT, `${name}.html`), html);

    return { name, height };
}

const shots = [];

function toggleRow(moduleId) {
    const row = Array.from(panel.element.querySelectorAll('.row:not(.row_header)')).find(
        (item) => item.querySelector('.module-id').textContent === moduleId,
    );

    row.click();
}

// «Модули» с раскрытой удачной загрузкой: водопад всех семи стадий и ресурсы
toggleRow('Module');
shots.push(write('panel-modules', 676));
toggleRow('Module');

// то же, но с раскрытой ошибкой - ради неё панель и открывают
toggleRow('AbstractModule');
shots.push(write('panel-error', 657));
toggleRow('AbstractModule');

activateTab('События');
shots.push(write('panel-events', 488));

activateTab('Share scope');
shots.push(write('panel-share-scope', 560));

// печатаем готовые команды: высота кадра у каждой картинки своя, и держать её в голове незачем
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PADDING = 24;

console.log(`html готовы в ${OUT}. Снять png:\n`);
shots.forEach(({ name, height }) => {
    console.log(
        `"${CHROME}" --headless --force-device-scale-factor=2 ` +
            `--window-size=928,${height + PADDING * 2} ` +
            `--screenshot="${path.join(OUT, `${name}.png`)}" "${path.join(OUT, `${name}.html`)}"`,
    );
});
