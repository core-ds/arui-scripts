/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function checkTypeScriptWatch(watchCommand, project, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [...watchCommand, '--pretty', 'false'], {
            cwd: project,
            detached: process.platform !== 'win32',
        });
        let output = '';
        let phase = 'initial compilation';
        let edits = 0;
        let finished = false;
        let failure;
        let retry;
        let killTimer;
        const timer = setTimeout(
            () => finish(new Error(`Watch timed out waiting for ${phase} (${edits} edits)`)),
            timeoutMs,
        );

        function finish(error) {
            if (finished) return;
            finished = true;
            failure = error;
            clearTimeout(timer);
            clearInterval(retry);
            stop('SIGTERM');
            killTimer = setTimeout(() => stop('SIGKILL'), 1000);
        }

        function stop(signal) {
            try {
                if (child.pid && process.platform !== 'win32') process.kill(-child.pid, signal);
                else child.kill(signal);
            } catch (error) {
                if (error.code !== 'ESRCH') throw error;
            }
        }

        function edit() {
            if (finished) return;
            try {
                edits += 1;
                fs.writeFileSync(
                    path.join(project, 'src/index.ts'),
                    `export const value: number = "wrong-${edits}";`,
                );
            } catch (error) {
                finish(error);
            }
        }

        function collect(chunk) {
            output += chunk.toString();
            if (finished) return;
            if (phase === 'initial compilation' && /Found 0 errors/.test(output)) {
                phase = 'change diagnostic';
                // The summary can reach the parent before filesystem watchers are registered.
                // Repeat distinct edits until an actual change diagnostic confirms watch works.
                edit();
                if (!finished) retry = setInterval(edit, 500);
            }
            if (phase === 'change diagnostic' && /TS2322/.test(output)) finish();
        }

        child.stdout.on('data', collect);
        child.stderr.on('data', collect);
        child.on('error', finish);
        child.on('close', (code, signal) => {
            clearTimeout(timer);
            clearInterval(retry);
            clearTimeout(killTimer);
            if (!finished)
                failure = new Error(
                    `Watch exited with ${code ?? signal} while waiting for ${phase}`,
                );
            if (failure) reject(new Error(`${failure.message}\n${output}`, { cause: failure }));
            else resolve();
        });
    });
}

module.exports = { checkTypeScriptWatch };
