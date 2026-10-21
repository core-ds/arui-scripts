import { type ChildProcess, execFileSync, spawn } from 'child_process';

import fs from 'fs-extra';

import { configs } from '../../configs/app-configs';

function reportProcessError(error: unknown) {
    const processError = error as NodeJS.ErrnoException & { status?: number };

    // The compiler may have exited before cleanup reached it.
    if (processError.code !== 'ESRCH' && processError.status !== 128) {
        console.error(processError.message);
    }
}

function isMissingProcess(error: unknown) {
    return ['ENOENT', 'ESRCH'].includes((error as NodeJS.ErrnoException).code ?? '');
}

/** /proc is available in Linux containers even when utilities such as ps are absent. */
function getLinuxProcessTree(pid: number): number[] {
    let tasks: string[];

    try {
        tasks = fs.readdirSync(`/proc/${pid}/task`);
    } catch (error) {
        if (isMissingProcess(error)) {
            return [pid];
        }

        throw error;
    }

    const children = new Set<number>();

    tasks.forEach((task) => {
        try {
            fs.readFileSync(`/proc/${pid}/task/${task}/children`, 'utf8')
                .trim()
                .split(/\s+/)
                .map(Number)
                .filter((childPid) => childPid > 0)
                .forEach((childPid) => children.add(childPid));
        } catch (error) {
            // A thread can exit between listing tasks and reading its children.
            if (!isMissingProcess(error)) {
                throw error;
            }
        }
    });

    return [...[...children].flatMap(getLinuxProcessTree), pid];
}

/** Keep the caller's process group while stopping descendants before their launcher on controlled exits. */
function getProcessTree(pid: number): number[] {
    if (process.platform === 'linux') {
        try {
            return getLinuxProcessTree(pid);
        } catch {
            // Fall back to ps if /proc is inaccessible.
        }
    }

    let output: string;

    try {
        output = execFileSync('ps', ['-A', '-o', 'pid,ppid'], { encoding: 'utf8' });
    } catch {
        // BusyBox ps already lists every process and may not support -A.
        output = execFileSync('ps', ['-o', 'pid,ppid'], { encoding: 'utf8' });
    }

    const children = new Map<number, number[]>();

    output.split(/\r?\n/).forEach((line) => {
        const [childPid, parentPid] = line.trim().split(/\s+/).map(Number);

        if (childPid > 0 && parentPid >= 0) {
            children.set(parentPid, [...(children.get(parentPid) ?? []), childPid]);
        }
    });

    function collect(parentPid: number): number[] {
        return [...(children.get(parentPid) ?? []).flatMap(collect), parentPid];
    }

    return collect(pid);
}

/** TS7 can run a native child behind its JS launcher, so stopping only the launcher leaks the watcher. */
function stopCompiler(compiler: ChildProcess) {
    if (!compiler.pid) {
        return;
    }

    if (process.platform === 'win32') {
        try {
            execFileSync('taskkill', ['/pid', String(compiler.pid), '/T', '/F'], {
                stdio: 'ignore',
            });
        } catch (error) {
            reportProcessError(error);
        }

        return;
    }

    let pids = [compiler.pid];

    try {
        pids = getProcessTree(compiler.pid);
    } catch (error) {
        reportProcessError(error);
    }

    pids.forEach((pid) => {
        try {
            process.kill(pid, 'SIGTERM');
        } catch (error) {
            reportProcessError(error);
        }
    });
}

export function runCompilers(pathToCompilers: Array<string | string[]>) {
    if (fs.pathExistsSync(configs.serverOutputPath)) {
        fs.removeSync(configs.serverOutputPath);
    }

    const compilers = pathToCompilers.map((pathToCompiler) => {
        const compiler = spawn(
            'node',
            Array.isArray(pathToCompiler) ? pathToCompiler : [pathToCompiler],
            {
                stdio: 'inherit',
                cwd: configs.cwd,
            },
        );

        compiler.on('error', onProcessError);
        compiler.on('close', (code) => onProcessClose(compiler, code));

        return compiler;
    });
    const activeCompilers = new Set(compilers);
    let stopping = false;

    const onInterrupt = () => stopCompilers(130);
    const onTerminate = () => stopCompilers(143);

    process.once('SIGINT', onInterrupt);
    process.once('SIGTERM', onTerminate);
    process.once('exit', cleanup);

    function removeStopListeners() {
        process.removeListener('SIGINT', onInterrupt);
        process.removeListener('SIGTERM', onTerminate);
        process.removeListener('exit', cleanup);
    }

    function cleanup() {
        if (stopping) {
            return;
        }

        stopping = true;
        removeStopListeners();
        activeCompilers.forEach(stopCompiler);
    }

    function stopCompilers(exitCode: number) {
        if (stopping) {
            return;
        }

        cleanup();
        process.exit(exitCode);
    }

    // в error приходит объект ошибки, а не код для выхода
    function onProcessError(error: Error) {
        console.error(error.message);
        stopCompilers(1);
    }

    function onProcessClose(compiler: ChildProcess, code: number | null) {
        if (code !== 0) {
            // code === null означает, что процесс убит сигналом
            stopCompilers(code ?? 1);
        }

        activeCompilers.delete(compiler);
        if (activeCompilers.size === 0) {
            removeStopListeners();
        }
    }
}
