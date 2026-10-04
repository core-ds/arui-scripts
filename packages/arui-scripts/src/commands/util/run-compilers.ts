import { spawn } from 'child_process';

import fs from 'fs-extra';

import { configs } from '../../configs/app-configs';

import { SHUTDOWN_TIMEOUT } from './graceful-shutdown';

export function runCompilers(pathToCompilers: Array<string | string[]>) {
    if (fs.pathExistsSync(configs.serverOutputPath)) fs.removeSync(configs.serverOutputPath);
    const compilers = pathToCompilers.map((file) =>
        spawn('node', Array.isArray(file) ? file : [file], { stdio: 'inherit', cwd: configs.cwd }),
    );
    const active = new Set(compilers);
    let stopping = false;
    let exitCode = 0;
    let timer: NodeJS.Timeout | undefined;
    const dispose = () => {
        process.removeListener('SIGINT', onSignal);
        process.removeListener('SIGTERM', onSignal);
        if (timer) clearTimeout(timer);
    };
    const finish = () => {
        dispose();
        if (stopping) process.exit(exitCode);
    };
    const force = () => {
        active.forEach((compiler) => compiler.kill('SIGKILL'));
        exitCode = exitCode || 1;
        finish();
    };
    const stop = (code: number) => {
        if (stopping) return;
        stopping = true;
        exitCode = code;
        if (!active.size) {
            finish();

            return;
        }
        // Children close native compilers and flush caches before they exit.
        timer = setTimeout(() => {
            console.error('Compiler processes did not stop within 10 seconds.');
            force();
        }, SHUTDOWN_TIMEOUT);
        active.forEach((compiler) => compiler.kill('SIGTERM'));
    };

    function onSignal() {
        if (stopping) force();
        else stop(0);
    }

    process.on('SIGINT', onSignal);
    process.on('SIGTERM', onSignal);
    compilers.forEach((compiler) => {
        compiler.on('error', (error: Error) => {
            console.error(error.message);
            stop(1);
        });
        compiler.on('close', (code: number | null) => {
            active.delete(compiler);
            if (!stopping && code !== 0) {
                stop(code ?? 1);

                return;
            }
            if (stopping && code && !exitCode) exitCode = code;
            if (!active.size) finish();
        });
    });
}
