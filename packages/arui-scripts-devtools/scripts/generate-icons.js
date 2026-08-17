/* eslint-disable */
/**
 * Рисует иконки расширения.
 *
 * Chrome принимает только растр, а тащить графическую библиотеку ради четырёх квадратиков
 * незачем: PNG собирается здесь же из сырых байтов. Скрипт нужен, чтобы иконки можно было
 * пересобрать, а не только унаследовать бинарником в репозитории.
 *
 * Знак простой намеренно: тёмная плашка дизайн-системы и акцентное кольцо на ней. В строке
 * расширений он различается по цвету, а не по деталям - в 16px деталей всё равно не видно.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'src', 'extension', 'icons');

/** цвета дизайн-системы core-components, тёмная тема */
const BACKGROUND = [11, 31, 53]; // --color-dark-bg-primary
const ACCENT = [239, 49, 36]; // --color-dark-border-accent
const SIZES = [16, 32, 48, 128];

function crc32(buffer) {
    let crc = ~0;

    for (let index = 0; index < buffer.length; index++) {
        crc ^= buffer[index];

        for (let bit = 0; bit < 8; bit++) {
            crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
        }
    }

    return ~crc >>> 0;
}

function chunk(type, data) {
    const length = Buffer.alloc(4);

    length.writeUInt32BE(data.length);

    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);

    crc.writeUInt32BE(crc32(typeAndData));

    return Buffer.concat([length, typeAndData, crc]);
}

/** @param pixels функция (x, y) -> [r, g, b, a] */
function encodePng(size, pixels) {
    const raw = Buffer.alloc(size * (size * 4 + 1));
    let offset = 0;

    for (let y = 0; y < size; y++) {
        // фильтр строки: 0 - без фильтра, нам хватает
        raw[offset++] = 0;

        for (let x = 0; x < size; x++) {
            const [r, g, b, a] = pixels(x, y);

            raw[offset++] = r;
            raw[offset++] = g;
            raw[offset++] = b;
            raw[offset++] = a;
        }
    }

    const header = Buffer.alloc(13);

    header.writeUInt32BE(size, 0);
    header.writeUInt32BE(size, 4);
    header[8] = 8; // бит на канал
    header[9] = 6; // truecolor + alpha
    header[10] = 0;
    header[11] = 0;
    header[12] = 0;

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', header),
        chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

/** сглаживание края: доля пикселя внутри фигуры на границе радиуса */
function coverage(distance, edge) {
    return Math.max(0, Math.min(1, edge - distance + 0.5));
}

function blend(background, foreground, alpha) {
    return background.map((value, index) =>
        Math.round(value + (foreground[index] - value) * alpha),
    );
}

function drawIcon(size) {
    const center = (size - 1) / 2;
    const radius = size * 0.5;
    const cornerRadius = size * 0.22;
    const ringOuter = size * 0.32;
    const ringInner = size * 0.18;

    return (x, y) => {
        // плашка со скруглением: расстояние до ближайшего угла скругления
        const dx = Math.max(Math.abs(x - center) - (radius - cornerRadius - 0.5), 0);
        const dy = Math.max(Math.abs(y - center) - (radius - cornerRadius - 0.5), 0);
        const plateAlpha = coverage(Math.hypot(dx, dy), cornerRadius);

        if (plateAlpha <= 0) {
            return [0, 0, 0, 0];
        }

        const distance = Math.hypot(x - center, y - center);
        const ringAlpha =
            coverage(distance, ringOuter) * (1 - coverage(distance, ringInner - 0.0001));

        const color = ringAlpha > 0 ? blend(BACKGROUND, ACCENT, ringAlpha) : BACKGROUND;

        return [...color, Math.round(plateAlpha * 255)];
    };
}

fs.mkdirSync(OUT, { recursive: true });

SIZES.forEach((size) => {
    const file = path.join(OUT, `icon-${size}.png`);

    fs.writeFileSync(file, encodePng(size, drawIcon(size)));
    console.log(`[generate-icons] ${path.relative(process.cwd(), file)}`);
});
