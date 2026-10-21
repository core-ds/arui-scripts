import { type ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { transformSync } from '@swc/core';

function waitUntil(predicate: () => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        let interval: ReturnType<typeof setInterval>;
        const timeout = setTimeout(() => {
            clearInterval(interval);
            reject(new Error('Compiler descendant did not stop'));
        }, 10000);

        interval = setInterval(() => {
            if (predicate()) {
                clearInterval(interval);
                clearTimeout(timeout);
                resolve();
            }
        }, 20);
    });
}

function isRunning(pid: number) {
    try {
        process.kill(pid, 0);

        return true;
    } catch {
        return false;
    }
}

const itPosix = process.platform === 'win32' ? it.skip : it;
const itLinux = process.platform === 'linux' ? it : it.skip;

describe('runCompilers process lifecycle', () => {
    let tmpDir: string;
    let supervisor: ChildProcess;
    let compilerPids: number[];

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-scripts-compilers-'));
        compilerPids = [];
    });

    afterEach(() => {
        compilerPids.forEach((pid) => {
            try {
                process.kill(pid, 'SIGKILL');
            } catch {
                // The compiler may already have exited.
            }
        });
        supervisor?.kill('SIGKILL');
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    async function startCompilers(detached = false, withoutPs = false) {
        const sourcePath = require.resolve('../run-compilers');
        const source = transformSync(fs.readFileSync(sourcePath, 'utf8'), {
            jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
            module: { type: 'commonjs' },
        }).code;
        const pidFile = path.join(tmpDir, 'pids.json');
        const failureFile = path.join(tmpDir, 'fail');
        const failingPidFile = path.join(tmpDir, 'failing.pid');
        const launcher = path.join(tmpDir, 'launcher.cjs');
        const failingCompiler = path.join(tmpDir, 'failing.cjs');

        // A JS launcher with a long-running child reproduces the TS7 launcher process tree.
        fs.writeFileSync(
            launcher,
            `const { spawn } = require('child_process');
const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'inherit' });
require('fs').writeFileSync(${JSON.stringify(pidFile)}, JSON.stringify([process.pid, child.pid]));`,
        );
        fs.writeFileSync(
            failingCompiler,
            `require('fs').writeFileSync(${JSON.stringify(failingPidFile)}, String(process.pid));
setInterval(() => {
    if (require('fs').existsSync(${JSON.stringify(failureFile)})) process.exit(2);
}, 20);`,
        );

        // Run the actual supervisor in its own process, substituting only app configuration.
        const bootstrap = `const Module = require('module');
${
    withoutPs
        ? `const childProcess = require('child_process');
const execFileSync = childProcess.execFileSync;
childProcess.execFileSync = (file, ...args) => {
    if (file === 'ps') throw Object.assign(new Error('spawn ps ENOENT'), { code: 'ENOENT' });
    return execFileSync(file, ...args);
};`
        : ''
}
const instance = new Module(${JSON.stringify(sourcePath)});
instance.paths = Module._nodeModulePaths(${JSON.stringify(path.dirname(sourcePath))});
instance.require = request => request === '../../configs/app-configs'
    ? { configs: { cwd: ${JSON.stringify(tmpDir)}, serverOutputPath: ${JSON.stringify(
            path.join(tmpDir, 'output'),
        )} } }
    : Module.prototype.require.call(instance, request);
instance._compile(${JSON.stringify(source)}, ${JSON.stringify(sourcePath)});
instance.exports.runCompilers(${JSON.stringify([launcher, failingCompiler])});`;

        supervisor = spawn(process.execPath, ['-e', bootstrap], {
            detached,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const closed = new Promise<number | null>((resolve, reject) => {
            supervisor.on('error', reject);
            supervisor.on('close', resolve);
        });

        await waitUntil(() => fs.existsSync(pidFile) && fs.existsSync(failingPidFile));
        compilerPids = [
            ...JSON.parse(fs.readFileSync(pidFile, 'utf8')),
            Number(fs.readFileSync(failingPidFile, 'utf8')),
        ];

        return { failureFile, closed };
    }

    it('stops a launcher descendant when another compiler fails', async () => {
        const { failureFile, closed } = await startCompilers();

        fs.writeFileSync(failureFile, '');

        expect(await closed).toBe(2);
        await waitUntil(() => compilerPids.every((pid) => !isRunning(pid)));
    }, 30000);

    itLinux(
        'stops Linux descendants when ps is unavailable',
        async () => {
            const { failureFile, closed } = await startCompilers(false, true);

            fs.writeFileSync(failureFile, '');

            await waitUntil(() => compilerPids.every((pid) => !isRunning(pid)));
            expect(await closed).toBe(2);
        },
        30000,
    );

    itPosix(
        'keeps compilers in the caller group for a group SIGKILL',
        async () => {
            const { closed } = await startCompilers(true);

            if (!supervisor.pid) {
                throw new Error('Supervisor did not start');
            }

            process.kill(-supervisor.pid, 'SIGKILL');

            await waitUntil(() => compilerPids.every((pid) => !isRunning(pid)));
            expect(await closed).toBeNull();
        },
        30000,
    );
});
