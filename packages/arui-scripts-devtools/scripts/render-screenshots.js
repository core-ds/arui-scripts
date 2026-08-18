/* eslint-disable */
/**
 * Готовит html для скриншотов расширения в docs/.
 *
 * Данные и сама панель приезжают из общего стенда `panel-fixture.js` - его же использует
 * скрипт ассетов для Chrome Web Store, чтобы картинки в README и в карточке стора показывали
 * одно и то же приложение.
 *
 * Как обновить картинки - в README, раздел «Как выглядит».
 */
const fs = require('fs');
const path = require('path');

const { frame, activateTab, toggleRow, panelElement, panelStyles } = require('./panel-fixture');

const PKG = path.join(__dirname, '..');
const OUT = process.argv[2] ?? path.join(PKG, 'docs');

fs.mkdirSync(OUT, { recursive: true });

/** высоты подобраны так, чтобы кадр обрезался по границе строки, а не посередине */
function write(name, height) {
    // `:host` вне shadow root не матчится ни на что - подменяем его на обёртку кадра
    const styles = panelStyles('.stage');
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
    shots.push(write('panel-events', 580));

    activateTab('Таймлайн');
    await frame();
    shots.push(write('panel-timeline', 460));

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
