/* eslint-disable */
/**
 * Готовит картинки для карточки Chrome Web Store.
 *
 * Стор принимает строго свои размеры: скриншоты 1280x800 (или 640x400), маленькая плитка
 * 440x280, иконка 128x128. Размер не подошёл - форма загрузки просто не примет файл, поэтому
 * html здесь верстается ровно под них, а png снимается с `--force-device-scale-factor=1`.
 *
 * Данные и сама панель - из общего стенда `panel-fixture.js`: в карточке стора должно быть
 * ровно то же приложение, что на картинках в README.
 *
 * Иконку 128x128 стор показывает на своём фоне и обрезает по своим правилам, поэтому знак
 * рисуется с полями: 96px рисунка внутри 128px холста - так его край не срежется.
 *
 * Как снять png - скрипт печатает готовые команды, как и `render-screenshots.js`.
 */
const fs = require('fs');
const path = require('path');

const { frame, activateTab, toggleRow, panelElement, panelStyles } = require('./panel-fixture');

const PKG = path.join(__dirname, '..');
const OUT = process.argv[2] ?? path.join(PKG, 'docs', 'store');

/** размеры, которые требует форма загрузки */
const SCREENSHOT = { width: 1280, height: 800 };
const PROMO = { width: 440, height: 280 };

/** цвета дизайн-системы core-components, тёмная тема */
const BACKGROUND = '#0b1f35';
const ACCENT = '#ef3124';
const TEXT = '#fff';
const TEXT_SECONDARY = 'rgba(255, 255, 255, 0.7)';

const FONT =
    "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, sans-serif";

fs.mkdirSync(OUT, { recursive: true });

const shots = [];

/**
 * Кадр со скриншотом: панель во всю ширину карточки, вокруг - поля цвета подложки DevTools.
 *
 * Панель растягивается на всю высоту кадра: в DevTools она занимает панель целиком, и врать
 * про это в сторе незачем.
 */
function writeScreenshot(name, caption) {
    const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><style>
    body {
        display: flex;
        flex-direction: column;
        gap: 20px;
        box-sizing: border-box;
        width: ${SCREENSHOT.width}px;
        height: ${SCREENSHOT.height}px;
        margin: 0;
        padding: 32px;
        background: ${BACKGROUND};
        font-family: ${FONT};
        overflow: hidden;
    }

    .caption {
        flex: none;
        color: ${TEXT_SECONDARY};
        font-size: 20px;
        line-height: 28px;
    }

    .caption b {
        color: ${TEXT};
        font-weight: 700;
    }

${panelStyles('.stage')}

    .stage {
        display: block;
        flex: 1;
        min-height: 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        overflow: hidden;
    }

    /* содержимое обрезается краем кадра: растушёвка показывает, что там есть продолжение,
       вместо обрубленной на середине строки */
    .frame {
        position: relative;
        display: flex;
        flex: 1;
        min-height: 0;
    }

    .frame:after {
        position: absolute;
        right: 1px;
        bottom: 1px;
        left: 1px;
        height: 48px;
        border-radius: 0 0 12px 12px;
        background: linear-gradient(rgba(11, 31, 53, 0), ${BACKGROUND});
        content: '';
    }
</style></head>
<body>
    <div class="caption">${caption}</div>
    <div class="frame"><div class="stage">${panelElement().outerHTML}</div></div>
</body></html>`;

    fs.writeFileSync(path.join(OUT, `${name}.html`), html);
    shots.push({ name, ...SCREENSHOT });
}

/** маленькая плитка каталога: знак, название и одна строка про то, зачем это */
function writePromo() {
    const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><style>
    body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-sizing: border-box;
        width: ${PROMO.width}px;
        height: ${PROMO.height}px;
        margin: 0;
        padding: 32px;
        background: ${BACKGROUND};
        color: ${TEXT};
        font-family: ${FONT};
        overflow: hidden;
    }

    .mark {
        box-sizing: border-box;
        width: 56px;
        height: 56px;
        margin-bottom: 20px;
        border: 10px solid ${ACCENT};
        border-radius: 50%;
    }

    .name {
        font-size: 32px;
        font-weight: 700;
        line-height: 40px;
    }

    .tagline {
        margin-top: 8px;
        color: ${TEXT_SECONDARY};
        font-size: 16px;
        line-height: 24px;
    }
</style></head>
<body>
    <div class="mark"></div>
    <div class="name">ARUI DevTools</div>
    <div class="tagline">Микрофронтенды arui-scripts: что грузилось, сколько заняло и почему упало</div>
</body></html>`;

    fs.writeFileSync(path.join(OUT, 'promo-440x280.html'), html);
    shots.push({ name: 'promo-440x280', ...PROMO });
}

async function main() {
    await frame();

    toggleRow('Module');
    await frame();
    writeScreenshot(
        'screenshot-modules',
        'Все загрузки модулей: <b>стадии, тайминги и ресурсы</b> каждой попытки',
    );
    toggleRow('Module');
    await frame();

    toggleRow('AbstractModule');
    await frame();
    writeScreenshot(
        'screenshot-error',
        'Упавшая загрузка: <b>стадия, сообщение и стек</b> вместо строчки в консоли',
    );
    toggleRow('AbstractModule');
    await frame();

    activateTab('Таймлайн');
    await frame();
    writeScreenshot(
        'screenshot-timeline',
        'Что грузилось параллельно, а что <b>ждало очереди</b> - с историей до перезагрузки',
    );

    activateTab('Share scope');
    await frame();
    writeScreenshot(
        'screenshot-share-scope',
        'Общие библиотеки: <b>кто какую версию просил</b> и кто получит не ту',
    );

    activateTab('Подмена');
    await frame();
    writeScreenshot(
        'screenshot-overrides',
        'Провайдер <b>переехал на localhost</b>: правка проверяется на стенде без выкладки',
    );

    writePromo();

    const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    console.log(`html готовы в ${OUT}. Снять png:\n`);
    shots.forEach(({ name, width, height }) => {
        console.log(
            `"${CHROME}" --headless --force-device-scale-factor=1 ` +
                `--window-size=${width},${height} ` +
                `--screenshot="${path.join(OUT, `${name}.png`)}" "${path.join(
                    OUT,
                    `${name}.html`,
                )}"`,
        );
    });

    process.exit(0);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
