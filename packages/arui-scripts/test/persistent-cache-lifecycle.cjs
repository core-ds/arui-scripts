/* Run after building arui-scripts. Exercises the real parent/client/watch shutdown path. */
/* eslint-disable @typescript-eslint/no-var-requires -- Standalone CommonJS integration fixture. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-cache-lifecycle-'));
const cli = path.resolve(__dirname, '../build/bin/index.js');

fs.mkdirSync(path.join(cwd, 'src/server'), { recursive: true });
fs.writeFileSync(
    path.join(cwd, 'package.json'),
    JSON.stringify({
        name: 'cache-lifecycle-fixture',
        version: '1.0.0',
        aruiScripts: { persistentCache: true, clientServerPort: 0 },
    }),
);
fs.writeFileSync(path.join(cwd, 'src/index.js'), 'console.log("client lifecycle");');
fs.writeFileSync(
    path.join(cwd, 'src/server/index.js'),
    'console.log("server lifecycle"); setInterval(() => {}, 1000);',
);
fs.writeFileSync(
    path.join(cwd, 'arui-scripts.overrides.js'),
    "const fs = require('fs'); module.exports = { devServer(config) { return {...config, host:'127.0.0.1'}; }, rspack(config) { for (const c of Array.isArray(config) ? config : [config]) { c.plugins.push({ apply(compiler) { compiler.hooks.done.tap('LifecycleFixture', stats => fs.writeFileSync(c.target === 'node' ? 'server-stats.json' : 'client-stats.json', JSON.stringify(stats.toJson({all:false, logging:'verbose', loggingDebug:/rspack\\.persistentCache/})))); }}); } return config; }};",
);

async function startAndStop(label) {
    fs.rmSync(path.join(cwd, 'client-stats.json'), { force: true });
    fs.rmSync(path.join(cwd, 'server-stats.json'), { force: true });
    const child = spawn(process.execPath, [cli, 'start'], {
        cwd,
        env: { ...process.env, CI: 'false', WATCHPACK_POLLING: '100' },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';

    child.stdout.on('data', (chunk) => {
        output += chunk;
    });
    child.stderr.on('data', (chunk) => {
        output += chunk;
    });
    const completed = new Promise((resolve, reject) => {
        child.on('error', reject);
        child.on('close', (code, signal) => resolve({ code, signal }));
    });
    const deadline = Date.now() + 30000;

    try {
        while (
            !fs.existsSync(path.join(cwd, 'client-stats.json')) ||
            !fs.existsSync(path.join(cwd, 'server-stats.json'))
        ) {
            if (child.exitCode !== null || Date.now() > deadline)
                throw new Error(`${label}: startup failed\n${output.slice(-5000)}`);
            // eslint-disable-next-line no-await-in-loop -- Poll this process before sending its stop signal.
            await new Promise((resolve) => {
                setTimeout(resolve, 50);
            });
        }
        const stats = JSON.parse(fs.readFileSync(path.join(cwd, 'client-stats.json')));
        const timer = setTimeout(() => child.kill('SIGKILL'), 12000);

        child.kill('SIGTERM');
        const result = await completed;

        clearTimeout(timer);
        assert.equal(
            result.code,
            0,
            `${label}: shutdown must wait for flush and exit successfully\n${output.slice(-5000)}`,
        );
        const files = fs.readdirSync(path.join(cwd, '.cache/arui-scripts/rspack'), {
            recursive: true,
        });

        assert.ok(files.some((file) => file.endsWith('.pack')));
        assert.ok(
            !files.some((file) => file.endsWith('.writer.json')),
            'leases must be released after native close',
        );
        if (label === 'warm')
            assert.ok(
                stats.logging?.['rspack.persistentCache']?.entries.some((entry) =>
                    entry.message.includes('make persistent cache recovery succeeded'),
                ),
                'warm dev must recover from disk',
            );
        console.log(
            `PASS: ${label} real dev startup, SIGTERM, server worker shutdown and cache flush`,
        );
    } finally {
        if (child.exitCode === null) child.kill('SIGKILL');
    }
}
(async () => {
    try {
        await startAndStop('cold');
        await startAndStop('warm');
    } finally {
        fs.rmSync(cwd, { recursive: true, force: true });
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
