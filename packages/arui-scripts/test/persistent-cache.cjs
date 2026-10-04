/* eslint-disable @typescript-eslint/no-var-requires -- Run directly as CommonJS in Node. */
/* Integration test: run after building arui-scripts. Every build uses a fresh process. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

let cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-persistent-cache-'));
const cli = path.resolve(__dirname, '../build/bin/index.js');
const write = (name, content) => fs.writeFileSync(path.join(cwd, name), content);
const json = (name, content) => write(name, JSON.stringify(content));
const payload = Array.from({ length: 1000 }, (_, i) =>
    crypto.createHash('sha256').update(String(i)).digest('hex'),
).join('-');

const source = (marker) =>
    `import "./fixture.css"; declare const AUDIT_MARKER: string; console.log(AUDIT_MARKER, ${JSON.stringify(
        marker,
    )}, ${JSON.stringify(payload)}); export {};`;

function artifacts(directory = path.join(cwd, '.build'), prefix = '') {
    return Object.fromEntries(
        fs
            .readdirSync(directory)
            .sort()
            .flatMap((name) => {
                const file = path.join(directory, name);
                const key = `${prefix}${name}`;

                if (fs.statSync(file).isDirectory())
                    return Object.entries(artifacts(file, `${key}/`));
                if (!/\.(js|css|gz|br|dcb|json)$/.test(name) || name === 'env-config.json')
                    return [];

                return [
                    [key, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')],
                ];
            }),
    );
}

function build(label, env = {}) {
    const started = Date.now();
    const result = spawnSync(process.execPath, [cli, 'build'], {
        cwd,
        env: { ...process.env, CI: 'false', ...env },
        encoding: 'utf8',
        timeout: 60000,
    });

    assert.equal(
        result.status,
        0,
        `${label}: ${result.error || ''}\n${result.stdout.slice(0, 6000)}\n${result.stderr.slice(
            0,
            3000,
        )}`,
    );
    if (result.stdout.includes('cache]') || result.stderr.includes('cache]'))
        console.log(result.stdout, result.stderr);
    const stats = JSON.parse(fs.readFileSync(path.join(cwd, 'client-stats.json'), 'utf8'));

    console.log(`${label}: ${Date.now() - started} ms`);

    return { stats, output: artifacts() };
}

function logs(stats) {
    return (stats.logging?.['rspack.persistentCache']?.entries || [])
        .map((entry) => entry.message)
        .join('\n');
}

try {
    fs.mkdirSync(path.join(cwd, 'src/server'), { recursive: true });
    json('package.json', {
        name: 'cache-fixture',
        version: '1.0.0',
        aruiScripts: {
            persistentCache: { env: ['AUDIT_ENV'] },
            dictionaryCompression: { dictionaryPath: ['./dictionary.txt'] },
        },
    });
    json('tsconfig.base.json', {
        compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            moduleResolution: 'bundler',
            types: [],
            skipLibCheck: true,
        },
    });
    json('tsconfig.json', { extends: './tsconfig.base.json', include: ['src'] });
    json('build-values.json', { marker: 'CONFIG_A' });
    write('yarn.lock', '# fixture lock v1\n');
    write('.browserslistrc', 'Chrome 100\n');
    write('dictionary.txt', payload.slice(0, 20000));
    write('src/css.d.ts', 'declare module "*.css"; declare function require(name: string): any;');
    write('src/fixture.css', 'body { color: red; padding: 10px; }');
    // eslint-disable-next-line no-template-curly-in-string -- The runtime placeholder must stay literal.
    write('env-config.json', '{"runtime":"${CACHE_RUNTIME}"}');
    write('src/index.ts', source('SOURCE_A'));
    write('src/server/index.ts', 'console.log("server-cache"); export {};');
    write(
        'arui-scripts.overrides.js',
        `
        const fs = require('fs');
        const values = require('./build-values.json');
        module.exports = { rspack(config) {
            for (const c of Array.isArray(config) ? config : [config]) {
                c.plugins.push({ apply(compiler) {
                    new compiler.webpack.DefinePlugin({ AUDIT_MARKER: JSON.stringify(values.marker + (process.env.AUDIT_ENV || '')) }).apply(compiler);
                    compiler.hooks.done.tap('CacheTest', stats => fs.writeFileSync(
                        c.target === 'node' ? 'server-stats.json' : 'client-stats.json',
                        JSON.stringify(stats.toJson({ all: false, modules: true, cachedModules: true, logging: 'verbose', loggingDebug: /rspack\\.persistentCache/ }))
                    ));
                }});
            }
            return config;
        }};
    `,
    );
    const cold = build('cold');
    const warm = build('warm');

    assert.match(logs(warm.stats), /make persistent cache recovery succeeded/);
    assert.deepEqual(
        warm.output,
        cold.output,
        'all emitted artifacts, including DCB, survive cache recovery',
    );
    assert.ok(
        Object.keys(warm.output).some((file) => file.endsWith('.dcb')),
        'DCB fixture must actually emit a file',
    );
    const serverStats = JSON.parse(fs.readFileSync(path.join(cwd, 'server-stats.json'), 'utf8'));

    assert.match(logs(serverStats), /make persistent cache recovery succeeded/);

    write('src/index.ts', source('SOURCE_B'));
    const edited = build('source edit');

    assert.notDeepEqual(edited.output, warm.output);
    const uncached = build('source edit, cache disabled', {
        ARUI_SCRIPTS_CONFIG: JSON.stringify({ persistentCache: false }),
    });

    assert.deepEqual(edited.output, uncached.output);

    write('dictionary.txt', payload.slice(10000, 35000));
    const dictionary = build('dictionary edit');

    assert.notDeepEqual(dictionary.output, edited.output);
    assert.deepEqual(build('dictionary warm').output, dictionary.output);

    json('build-values.json', { marker: 'CONFIG_B' });
    const configEdit = build('transitive override input');

    assert.match(logs(configEdit.stats), /invalid|changed/i);
    assert.notDeepEqual(configEdit.output, dictionary.output);
    json('tsconfig.base.json', {
        compilerOptions: {
            target: 'ES2021',
            module: 'ESNext',
            moduleResolution: 'bundler',
            types: [],
            skipLibCheck: true,
        },
    });
    assert.match(logs(build('extended tsconfig').stats), /invalid|changed/i);
    write('yarn.lock', '# fixture lock v2\n');
    assert.match(logs(build('lockfile edit').stats), /invalid|changed/i);
    write('.browserslistrc', 'Chrome 110\n');
    assert.match(logs(build('browserslist edit').stats), /invalid|changed/i);
    assert.match(
        logs(build('environment edit', { BROWSERSLIST: 'Chrome 120' }).stats),
        /invalid|changed|version/i,
    );

    const declaredEnv = build('declared compile env', { AUDIT_ENV: 'ENV_B' });

    assert.notDeepEqual(declaredEnv.output, configEdit.output);
    build('compile env reset');
    const readonly = build('readonly existing', {
        ARUI_SCRIPTS_CONFIG: JSON.stringify({ persistentCache: { readonly: true } }),
    });

    assert.match(logs(readonly.stats), /make persistent cache recovery succeeded/);
    const readonlyMissing = build('readonly missing', {
        ARUI_SCRIPTS_CONFIG: JSON.stringify({
            persistentCache: { readonly: true, directory: '.cache/readonly-missing' },
        }),
    });

    assert.deepEqual(readonlyMissing.output, readonly.output);

    fs.mkdirSync(path.join(cwd, 'node_modules'), { recursive: true });
    fs.mkdirSync(path.join(cwd, 'linked-package'), { recursive: true });
    json('linked-package/package.json', {
        name: 'cache-linked',
        version: '1.0.0',
        main: 'index.js',
    });
    write('linked-package/index.js', 'module.exports = "LINK_A";');
    fs.symlinkSync(path.join(cwd, 'linked-package'), path.join(cwd, 'node_modules/cache-linked'));
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')));

    pkg.dependencies = { 'cache-linked': 'file:./linked-package' };
    json('package.json', pkg);
    write('src/index.ts', `${source('SOURCE_LINK')}console.log(require("cache-linked"));`);
    const linked = build('linked package cold');

    assert.deepEqual(build('linked package warm').output, linked.output);
    write('linked-package/index.js', 'module.exports = "LINK_B";');
    assert.notDeepEqual(
        build('linked package source edit without version bump').output,
        linked.output,
    );

    write('src/index.ts', `${source('SOURCE_TYPE_ERROR')}const bad: string = 123;`);
    const failed = spawnSync(process.execPath, [cli, 'build'], {
        cwd,
        env: { ...process.env, CI: 'false' },
        encoding: 'utf8',
        timeout: 60000,
    });

    assert.notEqual(failed.status, 0, 'type errors must still fail after cache restore');
    assert.match(failed.stdout + failed.stderr, /TS2322|string/);
    write('src/index.ts', source('SOURCE_RECOVERED'));
    build('after type error');

    const originalCwd = cwd;
    const portableEnv = {
        ARUI_SCRIPTS_CONFIG: JSON.stringify({ persistentCache: { portable: true } }),
    };

    build('portable cold', portableEnv);
    const portableWarm = build('portable warm', portableEnv);

    assert.match(logs(portableWarm.stats), /make persistent cache recovery succeeded/);
    const relocated = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-cache-relocated-'));

    fs.cpSync(cwd, relocated, {
        recursive: true,
        filter: (file) => !file.includes('/node_modules') && !file.includes('/linked-package'),
    });
    cwd = relocated;
    try {
        const moved = build('portable new checkout path', portableEnv);

        // Rspack 2.2.5 relocation guard: first build in a new checkout is cold and correct.
        assert.match(logs(moved.stats), /invalid|version|changed/i);
        const movedWarm = build('portable relocated warm', portableEnv);

        assert.match(logs(movedWarm.stats), /make persistent cache recovery succeeded/);
        const movedFresh = build('portable relocated uncached parity', {
            ARUI_SCRIPTS_CONFIG: JSON.stringify({ persistentCache: false }),
        });

        assert.deepEqual(moved.output, movedFresh.output);
    } finally {
        cwd = originalCwd;
        fs.rmSync(relocated, { recursive: true, force: true });
    }

    const cacheRoot = path.join(cwd, '.cache/arui-scripts/rspack');
    const cacheFiles = fs
        .readdirSync(cacheRoot, { recursive: true })
        .filter((file) => file.endsWith('.pack'));

    assert.ok(cacheFiles.length > 0);
    cacheFiles.forEach((file) => fs.writeFileSync(path.join(cacheRoot, file), 'CORRUPT'));
    const recovered = build('corrupt cache recovery');

    assert.deepEqual(
        recovered.output,
        build('corrupt recovery uncached', {
            ARUI_SCRIPTS_CONFIG: JSON.stringify({ persistentCache: false }),
        }).output,
    );

    fs.mkdirSync(path.join(cwd, '.cache/unwritable'), { recursive: true });
    fs.chmodSync(path.join(cwd, '.cache/unwritable'), 0o555);
    try {
        assert.deepEqual(
            build('unwritable cache fallback', {
                ARUI_SCRIPTS_CONFIG: JSON.stringify({
                    persistentCache: { directory: '.cache/unwritable' },
                }),
            }).output,
            recovered.output,
        );
    } finally {
        fs.chmodSync(path.join(cwd, '.cache/unwritable'), 0o755);
    }

    const overridesPath = path.join(cwd, 'arui-scripts.overrides.js');
    const overrideContents = fs.readFileSync(overridesPath, 'utf8');

    fs.appendFileSync(overridesPath, '\nconsole.log("override diagnostic");\n');
    const info = spawnSync(process.execPath, [cli, 'cache:info', '--json'], {
        cwd,
        encoding: 'utf8',
    });

    assert.equal(info.status, 0, info.stderr);
    const report = JSON.parse(info.stdout);

    assert.ok(report.bytes > 0 && report.namespaces.length >= 2);
    assert.doesNotMatch(info.stdout, /ENV_B|runtime-other/);
    assert.doesNotMatch(info.stdout, /override diagnostic/);
    assert.match(info.stderr, /override diagnostic/);
    fs.writeFileSync(overridesPath, overrideContents);
    const clear = spawnSync(process.execPath, [cli, 'cache:clear'], { cwd, encoding: 'utf8' });

    assert.equal(clear.status, 0, clear.stderr);
    assert.ok(fs.existsSync(path.join(cwd, '.build')), 'clear must preserve build output');
    const devProgram = `
        const { createCompiler } = require(${JSON.stringify(
            path.resolve(__dirname, '../build/commands/util/create-compiler.js'),
        )});
        const { config } = require(${JSON.stringify(
            path.resolve(__dirname, '../build/configs/rspack.client.dev.js'),
        )});
        const compiler = createCompiler(config);
        compiler.run((error, stats) => { const failed = stats?.hasErrors(); compiler.close(closeError => {
            if (error || closeError || failed) {
                console.error(error || closeError || 'Compilation failed');
                process.exitCode = 1;
            }
        }); });
    `;

    for (const label of ['dev cold', 'dev warm']) {
        fs.rmSync(path.join(cwd, '.build'), { recursive: true, force: true });
        const result = spawnSync(process.execPath, ['-e', devProgram], {
            cwd,
            env: { ...process.env, NODE_ENV: 'development' },
            encoding: 'utf8',
            timeout: 60000,
        });

        assert.equal(result.status, 0, result.stderr);
        if (label === 'dev warm') {
            const stats = JSON.parse(fs.readFileSync(path.join(cwd, 'client-stats.json'), 'utf8'));

            assert.match(logs(stats), /make persistent cache recovery succeeded/);
        }
        console.log(`PASS: ${label}`);
    }
    for (const [label, value] of [
        ['runtime dev cold', 'runtime-new'],
        ['runtime dev warm', 'runtime-other'],
    ]) {
        const result = spawnSync(process.execPath, ['-e', devProgram], {
            cwd,
            encoding: 'utf8',
            timeout: 60000,
            env: {
                ...process.env,
                NODE_ENV: 'development',
                CACHE_RUNTIME: value,
                ARUI_SCRIPTS_CONFIG: JSON.stringify({ clientOnly: true }),
            },
        });

        assert.equal(result.status, 0, result.stderr);
        assert.equal(
            JSON.parse(fs.readFileSync(path.join(cwd, '.build/env-config.json'))).runtime,
            value,
        );
        console.log(`PASS: ${label}`);
    }
    console.log(
        'PASS: disk reuse, client/server isolation, source/config/dictionary invalidation and artifact parity',
    );
} finally {
    if (process.env.ARUI_CACHE_KEEP_FIXTURE) console.log(`Fixture: ${cwd}`);
    else fs.rmSync(cwd, { recursive: true, force: true });
}
