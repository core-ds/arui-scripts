/* eslint-disable */
/**
 * Сборка расширения для Chrome.
 *
 * На выходе - готовая к загрузке папка `build/extension`: манифест, две страницы и два бандла.
 * Собираем тем же стеком, каким arui-scripts собирает приложения (@rspack/core + swc).
 *
 * От пре-бандла панели (`bundle-mount.js`) отличается тем, что здесь никаких ограничений нет:
 * расширение - не npm-пакет, React инлайнится без оглядки на чужой бандлер, а `share-scope`
 * ничего не читает из свободных переменных - снимок скоупа приезжает в контракте от загрузчика.
 */
const fs = require('fs');
const path = require('path');

const { rspack } = require('@rspack/core');

const PKG = path.join(__dirname, '..');
const SRC = path.join(PKG, 'src', 'extension');
const OUT = path.join(PKG, 'build', 'extension');

/** статика расширения: копируется как есть */
const ASSETS = ['devtools.html', 'panel.html'];

/** иконки: Chrome принимает только растр, поэтому они лежат готовыми (scripts/generate-icons.js) */
const ICONS_DIR = 'icons';

function createConfig() {
    return {
        context: PKG,
        mode: 'production',
        devtool: false,
        entry: {
            devtools: path.join(SRC, 'devtools.ts'),
            panel: path.join(SRC, 'panel.tsx'),
        },
        target: ['web', 'es2020'],
        output: {
            path: OUT,
            filename: '[name].js',
            // страницы расширения подключают файлы по фиксированным именам
            chunkFilename: '[name].chunk.js',
            clean: true,
        },
        resolve: { extensions: ['.tsx', '.ts', '.js'] },
        module: {
            rules: [
                {
                    // стили вставляются в shadow root строкой - см. panel.tsx
                    test: /\.css$/,
                    type: 'asset/source',
                },
                {
                    test: /\.tsx?$/,
                    loader: 'builtin:swc-loader',
                    options: {
                        jsc: {
                            parser: { syntax: 'typescript', tsx: true },
                            transform: { react: { runtime: 'automatic' } },
                            // расширение работает только в свежем Chrome, даунлевелить незачем
                            target: 'es2020',
                        },
                    },
                    type: 'javascript/auto',
                },
            ],
        },
        optimization: {
            // две независимые страницы: общий чанк им неоткуда подгрузить
            splitChunks: false,
            nodeEnv: 'production',
        },
        performance: { hints: false },
    };
}

function runRspack(config) {
    return new Promise((resolve, reject) => {
        const compiler = rspack(config);

        compiler.run((runError, stats) => {
            compiler.close(() => {
                if (runError) {
                    return reject(runError);
                }

                if (stats?.hasErrors()) {
                    return reject(new Error(stats.toString({ errors: true, all: false })));
                }

                return resolve(stats);
            });
        });
    });
}

function fail(message) {
    console.error(`[bundle-extension] ${message}`);
    process.exit(1);
}

function copyAssets() {
    for (const asset of ASSETS) {
        fs.copyFileSync(path.join(SRC, asset), path.join(OUT, asset));
    }

    fs.cpSync(path.join(SRC, ICONS_DIR), path.join(OUT, ICONS_DIR), { recursive: true });
}

/**
 * Кладёт манифест, подставив версию пакета.
 *
 * Версия расширения обязана совпадать с версией пакета: иначе по номеру в chrome://extensions
 * нельзя понять, что именно установлено, а обновлять расширение приходится вручную.
 */
function writeManifest() {
    const manifest = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
    const { version } = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8'));

    // Chrome принимает только числовые версии вида 1.2.3 - префиксы и суффиксы npm ему чужие
    const numeric = /^\d+(\.\d+){0,3}$/.test(version) ? version : manifest.version;

    fs.writeFileSync(
        path.join(OUT, 'manifest.json'),
        `${JSON.stringify({ ...manifest, version: numeric }, null, 4)}\n`,
    );

    return numeric;
}

function assertBundle() {
    for (const file of ['devtools.js', 'panel.js', 'manifest.json', ...ASSETS]) {
        const full = path.join(OUT, file);

        if (!fs.existsSync(full)) {
            fail(`${file}: не оказалось в сборке`);
        }
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8'));

    // иконки объявлены - значит должны быть на месте, иначе Chrome ругается при установке
    Object.values(manifest.icons ?? {}).forEach((icon) => {
        if (!fs.existsSync(path.join(OUT, icon))) {
            fail(`${icon}: иконка объявлена в манифесте, но её нет в сборке`);
        }
    });

    // host-права остаются опциональными: до включения подмены расширение не имеет прав
    // ни на одну страницу, и это его главное свойство с точки зрения согласования
    if (manifest.host_permissions) {
        fail('манифест просит host_permissions на старте - они должны оставаться опциональными');
    }

    const panel = fs.readFileSync(path.join(OUT, 'panel.js'), 'utf8');

    if (!panel.includes('__ARUI_DEVTOOLS__')) {
        fail('panel.js: пропало выражение, которым панель спрашивает страницу про стор');
    }

    // страница инспектируется через eval, читать её глобалы напрямую расширение не может
    if (panel.includes('__webpack_share_scopes__')) {
        fail('panel.js: расширение пытается читать share scope напрямую - его там не видно');
    }

    // мост видимости: страница devtools зовёт панель по этому ключу, панель по нему же себя
    // и объявляет. Разъедутся - панель молча продолжит опрашивать страницу из-под спуда
    const devtools = fs.readFileSync(path.join(OUT, 'devtools.js'), 'utf8');

    ['devtools.js', 'panel.js'].forEach((file, index) => {
        if (!(index === 0 ? devtools : panel).includes('__ARUI_DEVTOOLS_PANEL__')) {
            fail(
                `${file}: пропал ключ моста видимости - опрос страницы перестанет вставать на паузу`,
            );
        }
    });

    const size = ['devtools.js', 'panel.js'].reduce(
        (total, file) => total + fs.statSync(path.join(OUT, file)).size,
        0,
    );

    console.log(`[bundle-extension] build/extension: ${Math.round(size / 1024)} КБ`);
}

async function main() {
    await runRspack(createConfig());
    copyAssets();

    const version = writeManifest();

    assertBundle();
    console.log(
        `[bundle-extension] готово: ${path.relative(process.cwd(), OUT)}, версия ${version}`,
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
