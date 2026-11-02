/* eslint-disable @typescript-eslint/no-var-requires, no-await-in-loop */
// Startup and shutdown polling must await each check before trying again.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const net = require('node:net');
const path = require('node:path');
const { stripVTControlCharacters } = require('node:util');
const { setTimeout: delay } = require('node:timers/promises');

const example = path.resolve(__dirname, '../example');
const timeout = Number(process.env.START_SMOKE_TIMEOUT_MS || 45000);
const controller = new AbortController();
const { signal } = controller;

async function reservePort() {
    const server = net.createServer();

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '0.0.0.0', resolve);
    });

    return {
        port: server.address().port,
        close: () =>
            new Promise((resolve, reject) => {
                server.close((error) => (error ? reject(error) : resolve()));
            }),
    };
}

function groupExists(pid) {
    try {
        process.kill(-pid, 0);

        return true;
    } catch (error) {
        if (error.code === 'ESRCH') return false;
        throw error;
    }
}

async function stop(child) {
    if (!child?.pid || !groupExists(child.pid)) return;

    process.kill(-child.pid, 'SIGTERM');
    const deadline = Date.now() + 3000;

    while (groupExists(child.pid) && Date.now() < deadline) {
        await delay(50);
    }
    if (groupExists(child.pid)) {
        process.kill(-child.pid, 'SIGKILL');
    }
}

async function get(url) {
    const response = await fetch(url, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]),
    });

    assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);

    return { body: await response.text(), type: response.headers.get('content-type') || '' };
}

async function verifyHttp(origin, assetsPath) {
    const html = await get(`${origin}/`);

    assert(html.body.includes(`/${assetsPath}/`), 'SSR responded with a different build');
    const script = html.body.match(/<script[^>]*src=['"]([^'"]+\.js)['"]/);

    assert(script, 'SSR did not include a JavaScript entry');
    const mainScript = await get(new URL(script[1], origin));
    const worker = await get(`${origin}/${assetsPath}/worker.js`);

    assert(
        /javascript/.test(mainScript.type) && mainScript.body.length > 0,
        'Expected JavaScript entry',
    );
    assert(/javascript/.test(worker.type) && worker.body.length > 0, 'Expected worker JavaScript');
}

function assertRunning(child, childError, output) {
    if (childError)
        throw new Error(`Unable to start yarn: ${childError.message}`, { cause: childError });
    if (child.exitCode !== null || child.signalCode !== null) {
        throw new Error(
            `yarn start exited before readiness (${child.exitCode ?? child.signalCode})`,
        );
    }
    if (/\b(?:TypeError|Error):|ERROR in|compiled with[^\n]*errors?|error TS\d+/.test(output)) {
        throw new Error('yarn start reported a startup or compilation error');
    }
}

async function main() {
    assert(Number.isFinite(timeout) && timeout > 0, 'START_SMOKE_TIMEOUT_MS must be positive');
    const timer = setTimeout(
        () => controller.abort(new Error(`Start timed out after ${timeout} ms`)),
        timeout,
    );
    const interrupt = () => controller.abort(new Error('Start smoke test interrupted'));
    const ports = [];
    let buildPath;
    let child;
    let output = '';
    let childError;
    let lastHttpError;

    process.once('SIGINT', interrupt);
    process.once('SIGTERM', interrupt);

    try {
        ports.push(await reservePort());
        ports.push(await reservePort());
        signal.throwIfAborted();
        const [server, client] = ports;

        buildPath = await fs.mkdtemp(path.join(example, '.build-start-'));
        const assetsPath = `assets-${path.basename(buildPath)}`;
        const config = {
            serverPort: server.port,
            clientServerPort: client.port,
            buildPath,
            assetsPath,
        };

        await Promise.all(ports.map((port) => port.close()));
        ports.length = 0;
        child = spawn('yarn', ['start'], {
            cwd: example,
            env: { ...process.env, ARUI_SCRIPTS_CONFIG: JSON.stringify(config) },
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        child.on('error', (error) => {
            childError = error;
        });
        const collect = (chunk) => {
            // Retain startup diagnostics, without printing successful compiler output in hooks.
            output = (output + stripVTControlCharacters(chunk.toString())).slice(-131072);
        };

        child.stdout.on('data', collect);
        child.stderr.on('data', collect);

        while (!signal.aborted) {
            signal.throwIfAborted();
            assertRunning(child, childError, output);

            const compiled =
                /\[Server\][^\n]*compiled successfully/.test(output) &&
                /\[Client\][^\n]*compiled successfully/.test(output) &&
                /worker[^\n]*compiled successfully/.test(output) &&
                /Found 0 errors\. Watching for file changes/.test(output);

            if (compiled) {
                try {
                    await verifyHttp(`http://127.0.0.1:${client.port}`, assetsPath);
                    signal.throwIfAborted();
                    assertRunning(child, childError, output);
                    console.log(
                        'example start: client, server, worker, SSR proxy and JavaScript are ready',
                    );

                    return;
                } catch (error) {
                    lastHttpError = error;
                }
            }

            await delay(100, undefined, { signal });
        }
        signal.throwIfAborted();
    } catch (error) {
        throw new Error(
            `${signal.reason?.message || error.message}${
                lastHttpError ? `\nHTTP check: ${lastHttpError.message}` : ''
            }\n${output}`,
            { cause: error },
        );
    } finally {
        clearTimeout(timer);
        process.removeListener('SIGINT', interrupt);
        process.removeListener('SIGTERM', interrupt);
        try {
            await stop(child);
        } finally {
            await Promise.all(ports.map((port) => port.close()));
            if (buildPath) await fs.rm(buildPath, { recursive: true, force: true });
        }
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
