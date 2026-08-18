/* eslint-disable */
/**
 * Собирает zip для Chrome Web Store из `build/extension`.
 *
 * Стор принимает только архив, причём с манифестом в корне, а не в подпапке - самая частая
 * ошибка при первой загрузке. Здесь этого не случится по построению: архив собирается
 * из содержимого папки, а не из неё самой.
 *
 * Zip пишется руками из zlib, как и png иконок: тащить архиватор в зависимости ради
 * тридцати строк незачем, а заодно архив получается воспроизводимым - одинаковая сборка
 * даёт одинаковые байты, и по ним видно, что именно уехало в стор.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PKG = path.join(__dirname, '..');
const SOURCE = path.join(PKG, 'build', 'extension');
const OUT = path.join(PKG, 'build');

/** метка времени в zip фиксирована: иначе одинаковые сборки дают разные архивы */
const DOS_TIME = 0;
const DOS_DATE = 33; // 1 января 1980, минимальная дата формата

function fail(message) {
    console.error(`[pack-extension] ${message}`);
    process.exit(1);
}

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

/** все файлы папки, путями относительно неё; порядок фиксирован ради воспроизводимости */
function listFiles(directory, prefix = '') {
    return fs
        .readdirSync(directory, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap((entry) => {
            const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

            return entry.isDirectory()
                ? listFiles(path.join(directory, entry.name), relative)
                : [relative];
        });
}

function createZip(files) {
    const chunks = [];
    const central = [];
    let offset = 0;

    files.forEach(({ name, content }) => {
        const deflated = zlib.deflateRawSync(content, { level: 9 });
        // несжимаемое кладём как есть: так делают все архиваторы, и стор это принимает
        const stored = deflated.length >= content.length;
        const data = stored ? content : deflated;
        const nameBuffer = Buffer.from(name, 'utf8');
        const header = Buffer.alloc(30);

        header.writeUInt32LE(0x04034b50, 0);
        header.writeUInt16LE(20, 4); // версия, нужная для распаковки
        header.writeUInt16LE(0x0800, 6); // имена в utf-8
        header.writeUInt16LE(stored ? 0 : 8, 8); // метод: без сжатия или deflate
        header.writeUInt16LE(DOS_TIME, 10);
        header.writeUInt16LE(DOS_DATE, 12);
        header.writeUInt32LE(crc32(content), 14);
        header.writeUInt32LE(data.length, 18);
        header.writeUInt32LE(content.length, 22);
        header.writeUInt16LE(nameBuffer.length, 26);
        header.writeUInt16LE(0, 28);

        chunks.push(header, nameBuffer, data);

        const entry = Buffer.alloc(46);

        entry.writeUInt32LE(0x02014b50, 0);
        entry.writeUInt16LE(20, 4); // чем создан
        entry.writeUInt16LE(20, 6); // чем распаковывать
        entry.writeUInt16LE(0x0800, 8);
        entry.writeUInt16LE(stored ? 0 : 8, 10);
        entry.writeUInt16LE(DOS_TIME, 12);
        entry.writeUInt16LE(DOS_DATE, 14);
        entry.writeUInt32LE(crc32(content), 16);
        entry.writeUInt32LE(data.length, 20);
        entry.writeUInt32LE(content.length, 24);
        entry.writeUInt16LE(nameBuffer.length, 28);
        entry.writeUInt32LE(offset, 42);

        central.push(Buffer.concat([entry, nameBuffer]));
        offset += header.length + nameBuffer.length + data.length;
    });

    const directory = Buffer.concat(central);
    const end = Buffer.alloc(22);

    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(files.length, 8);
    end.writeUInt16LE(files.length, 10);
    end.writeUInt32LE(directory.length, 12);
    end.writeUInt32LE(offset, 16);

    return Buffer.concat([...chunks, directory, end]);
}

function main() {
    if (!fs.existsSync(path.join(SOURCE, 'manifest.json'))) {
        fail('сначала соберите расширение: yarn build');
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(SOURCE, 'manifest.json'), 'utf8'));
    const files = listFiles(SOURCE).map((name) => ({
        name,
        content: fs.readFileSync(path.join(SOURCE, name)),
    }));

    // стор ищет манифест в корне архива: с папкой внутри загрузка отваливается сразу
    if (!files.some((file) => file.name === 'manifest.json')) {
        fail('manifest.json должен лежать в корне архива');
    }

    // карты исходников раздувают архив и в сторе не нужны никому
    const maps = files.filter((file) => file.name.endsWith('.map'));

    if (maps.length) {
        fail(`в сборке остались карты исходников: ${maps.map((file) => file.name).join(', ')}`);
    }

    const archive = createZip(files);
    const target = path.join(OUT, `arui-devtools-${manifest.version}.zip`);

    fs.writeFileSync(target, archive);

    console.log(`[pack-extension] файлов: ${files.length}`);
    files.forEach((file) => console.log(`  ${file.name}`));
    console.log(
        `[pack-extension] ${path.relative(process.cwd(), target)}: ${Math.round(
            archive.length / 1024,
        )} КБ, версия ${manifest.version}`,
    );
}

main();
