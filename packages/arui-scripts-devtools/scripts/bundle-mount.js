/* eslint-disable */
/**
 * Пре-бандл lazy-части панели поверх tsc-сборки.
 *
 * Заменяет tsc-артефакты `build/mount.js` (cjs) и `build/esm/mount.js` (esm) на
 * самодостаточные бандлы: React внутри приватной копией, снаружи — тот же интерфейс модуля.
 * Точка code-split у потребителя не меняется: install.ts делает `import('./mount')`,
 * и rspack приложения выделяет этот файл в отдельный чанк.
 *
 * Почему бандлим из исходников, а не из tsc-вывода: нужен jsx и резолв react из
 * devDependencies этого пакета — у tsc-вывода то и другое уже потеряно/зафиксировано.
 *
 * Собираем тем же стеком, каким arui-scripts собирает приложения: @rspack/core + swc.
 *
 * Инварианты, которые охраняют ассерты ниже:
 *
 * 1. Панель не читает `__webpack_share_scopes__`: скоуп ей приезжает в контракте, снятый
 *    загрузчиком. Появись это обращение здесь - rspack нашей сборки подменил бы переменную
 *    собственным (пустым) скоупом бандла, и вкладка показывала бы не то приложение.
 *
 * 2. React инлайнится production-сборкой с зафиксированным NODE_ENV: в dev-сборке потребителя
 *    `process.env.NODE_ENV` может быть буквально `undefined`, и решать это на его стороне нельзя.
 */
const fs = require('fs');
const path = require('path');

const { rspack } = require('@rspack/core');

const PKG = path.join(__dirname, '..');
const SRC = path.join(PKG, 'src');
const BUILD = path.join(PKG, 'build');

/** до этапа перевода на React энтрипоинт лежит в mount.ts, после — в mount.tsx */
const ENTRY = fs.existsSync(path.join(SRC, 'mount.tsx'))
    ? path.join(SRC, 'mount.tsx')
    : path.join(SRC, 'mount.ts');

/** жёсткий потолок размера бандла; мягкое предупреждение — на 100 КБ раньше */
const SIZE_LIMIT = 400 * 1024;
const SIZE_WARN = 300 * 1024;

function createConfig({ outDir, esm }) {
    return {
        context: PKG,
        mode: 'production',
        devtool: false,
        entry: ENTRY,
        target: ['web', 'es2019'],
        output: {
            path: outDir,
            filename: 'mount.js',
            module: esm,
            library: { type: esm ? 'module' : 'commonjs2' },
            chunkFormat: esm ? 'module' : 'commonjs',
        },
        experiments: { outputModule: esm },
        resolve: { extensions: ['.tsx', '.ts', '.js'] },
        module: {
            rules: [
                {
                    // css панели приезжает в бандл строкой и вставляется в <style>
                    // внутри shadow root - см. mount.tsx
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
                            // floor потребителей: iOS >= 14 / Android >= 6 (supporting-browsers
                            // arui-scripts); их лоадеры наш файл дополнительно не даунлевелят
                            target: 'es2019',
                        },
                    },
                    type: 'javascript/auto',
                },
            ],
        },
        optimization: {
            // один файл: сплитить нечего, а NODE_ENV фиксируем production независимо от хоста
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
    console.error(`[bundle-mount] ${message}`);
    process.exit(1);
}

function assertBundle(file) {
    const content = fs.readFileSync(file, 'utf8');
    const relative = path.relative(PKG, file);

    if (content.includes('__webpack_share_scopes__')) {
        fail(
            `${relative}: панель обратилась к __webpack_share_scopes__ — на этой сборке rspack подменит его пустым скоупом бандла. Скоуп приезжает в контракте от загрузчика`,
        );
    }

    if (/require\(["']react["']\)|from\s*["']react["']/.test(content)) {
        fail(`${relative}: остался внешний импорт react — бандл обязан быть самодостаточным`);
    }

    const size = Buffer.byteLength(content);

    if (size > SIZE_LIMIT) {
        fail(`${relative}: ${Math.round(size / 1024)} КБ — больше потолка ${SIZE_LIMIT / 1024} КБ`);
    }

    if (size > SIZE_WARN) {
        console.warn(
            `[bundle-mount] ${relative}: ${Math.round(
                size / 1024,
            )} КБ — тяжелее ожидаемого, проверь состав бандла`,
        );
    }

    console.log(`[bundle-mount] ${relative}: ${Math.round(size / 1024)} КБ`);
}

/** мёртвый tsc-эмит React-кода: его содержимое уже внутри бандла, а import 'react' в npm нельзя */
function pruneDeadEmit() {
    for (const dir of [path.join(BUILD, 'panel'), path.join(BUILD, 'esm', 'panel')]) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

function assertNoReactOutsideBundle() {
    const offenders = [];

    (function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(full);
            } else if (
                entry.name.endsWith('.js') &&
                entry.name !== 'mount.js' &&
                /require\(["']react|from\s*["']react/.test(fs.readFileSync(full, 'utf8'))
            ) {
                offenders.push(path.relative(PKG, full));
            }
        }
    })(BUILD);

    if (offenders.length > 0) {
        fail(
            `ссылки на react вне бандла: ${offenders.join(
                ', ',
            )} — react не является зависимостью пакета`,
        );
    }
}

function smokeRequire() {
    // артефакт обязан загружаться без DOM: у mount нет побочных эффектов на импорте
    const mount = require(path.join(BUILD, 'mount.js'));

    if (typeof mount.mountDevtools !== 'function') {
        fail('build/mount.js: mountDevtools не экспортируется — интерфейс модуля сломан');
    }
}

async function main() {
    await runRspack(createConfig({ outDir: BUILD, esm: false }));
    await runRspack(createConfig({ outDir: path.join(BUILD, 'esm'), esm: true }));

    pruneDeadEmit();

    assertBundle(path.join(BUILD, 'mount.js'));
    assertBundle(path.join(BUILD, 'esm', 'mount.js'));
    assertNoReactOutsideBundle();
    smokeRequire();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
