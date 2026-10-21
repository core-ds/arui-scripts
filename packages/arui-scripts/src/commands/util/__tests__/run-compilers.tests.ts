import { execFileSync, spawn } from 'child_process';
import { EventEmitter } from 'events';

import fs from 'fs-extra';

import { runCompilers } from '../run-compilers';

jest.mock('child_process', () => ({ spawn: jest.fn(), execFileSync: jest.fn() }));
jest.mock('fs-extra', () => ({
    pathExistsSync: () => false,
    removeSync: jest.fn(),
    readdirSync: jest.fn(),
    readFileSync: jest.fn(),
}));
jest.mock('../../../configs/app-configs', () => ({
    configs: { cwd: '/app', serverOutputPath: '/app/.build' },
}));

type FakeProcess = EventEmitter & { pid: number | undefined };

function createFakeProcess(pid = 1001): FakeProcess {
    return Object.assign(new EventEmitter(), { pid });
}

describe('runCompilers', () => {
    const originalPlatform = process.platform;
    const processEvents: EventEmitter = process;
    const spawnMock = spawn as jest.Mock;
    const execFileSyncMock = execFileSync as jest.Mock;
    const readDirectoryMock = fs.readdirSync as jest.Mock;
    const readFileMock = fs.readFileSync as jest.Mock;
    let exitSpy: jest.SpyInstance;
    let killSpy: jest.SpyInstance;
    let stopListeners: Map<string, ReturnType<EventEmitter['listeners']>>;

    beforeEach(() => {
        spawnMock.mockReset();
        execFileSyncMock.mockReset().mockReturnValue('PID PPID\n');
        readDirectoryMock.mockReset();
        readFileMock.mockReset();
        Object.defineProperty(process, 'platform', { value: 'darwin' });
        exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
        killSpy = jest.spyOn(process, 'kill').mockImplementation(() => true);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        stopListeners = new Map(
            ['SIGINT', 'SIGTERM', 'exit'].map((event) => [event, processEvents.listeners(event)]),
        );
    });

    afterEach(() => {
        stopListeners.forEach((listeners, event) => {
            processEvents.listeners(event).forEach((listener) => {
                if (!listeners.includes(listener)) {
                    processEvents.removeListener(event, listener as () => void);
                }
            });
        });
        Object.defineProperty(process, 'platform', { value: originalPlatform });
        jest.restoreAllMocks();
    });

    it('spawns every compiler in project directory and the caller process group', () => {
        spawnMock.mockImplementation(() => createFakeProcess());

        runCompilers(['client.js', ['tsc.js', '--watch']]);

        expect(spawnMock).toHaveBeenCalledWith(
            'node',
            ['client.js'],
            expect.objectContaining({ cwd: '/app' }),
        );
        expect(spawnMock).toHaveBeenCalledWith(
            'node',
            ['tsc.js', '--watch'],
            expect.objectContaining({ cwd: '/app' }),
        );
        expect(spawnMock.mock.calls.every((call) => !call[2].detached)).toBe(true);
    });

    it('stops all compilers and exits with 1 when compiler fails to start', () => {
        const processes = [createFakeProcess(), createFakeProcess(1002)];

        processes[0].pid = undefined;
        spawnMock.mockImplementation(() => processes[spawnMock.mock.calls.length - 1]);

        runCompilers(['client.js', 'server.js']);
        processes[0].emit('error', new Error('spawn node ENOENT'));
        expect(killSpy).toHaveBeenCalledTimes(1);
        expect(killSpy).toHaveBeenCalledWith(1002, 'SIGTERM');
        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it.each([2, null])('uses compiler exit code %s and treats signals as failure', (code) => {
        const compiler = createFakeProcess();

        spawnMock.mockImplementation(() => compiler);

        runCompilers(['client.js']);
        compiler.emit('close', code);

        expect(killSpy).toHaveBeenCalledWith(1001, 'SIGTERM');
        expect(exitSpy).toHaveBeenCalledWith(code ?? 1);
    });

    it('continues cleanup when a process has already exited', () => {
        const processes = [createFakeProcess(), createFakeProcess(1002)];

        spawnMock.mockImplementation(() => processes[spawnMock.mock.calls.length - 1]);
        killSpy.mockImplementationOnce(() => {
            throw Object.assign(new Error('No such process'), { code: 'ESRCH' });
        });

        runCompilers(['client.js', 'server.js']);
        processes[0].emit('close', 2);

        expect(killSpy).toHaveBeenCalledWith(1002, 'SIGTERM');
        expect(exitSpy).toHaveBeenCalledWith(2);
    });

    it('stops nested descendants before their launcher', () => {
        const compiler = createFakeProcess();

        spawnMock.mockImplementation(() => compiler);
        execFileSyncMock.mockReturnValue('PID PPID\n1001 900\n2001 1001\n3001 2001\n4001 900\n');

        runCompilers(['tsc.js']);
        compiler.emit('close', 2);

        expect(killSpy.mock.calls).toEqual([
            [3001, 'SIGTERM'],
            [2001, 'SIGTERM'],
            [1001, 'SIGTERM'],
        ]);
    });

    it('supports BusyBox ps without the all-processes flag', () => {
        const compiler = createFakeProcess();

        spawnMock.mockImplementation(() => compiler);
        execFileSyncMock
            .mockImplementationOnce(() => {
                throw new Error('ps: invalid option -- A');
            })
            .mockReturnValue('PID PPID\n2001 1001\n');

        runCompilers(['tsc.js']);
        compiler.emit('close', 2);

        expect(execFileSyncMock).toHaveBeenCalledWith('ps', ['-o', 'pid,ppid'], {
            encoding: 'utf8',
        });
        expect(killSpy.mock.calls).toEqual([
            [2001, 'SIGTERM'],
            [1001, 'SIGTERM'],
        ]);
    });

    it('still stops the launcher if ps is unavailable', () => {
        const compiler = createFakeProcess();

        spawnMock.mockImplementation(() => compiler);
        execFileSyncMock.mockImplementation(() => {
            throw Object.assign(new Error('spawn ps ENOENT'), { code: 'ENOENT' });
        });

        runCompilers(['tsc.js']);
        compiler.emit('close', 2);

        expect(killSpy).toHaveBeenCalledWith(1001, 'SIGTERM');
        expect(exitSpy).toHaveBeenCalledWith(2);
    });

    it('finds Linux descendants from every thread without external utilities', () => {
        const compiler = createFakeProcess();

        Object.defineProperty(process, 'platform', { value: 'linux' });
        spawnMock.mockImplementation(() => compiler);
        readDirectoryMock.mockImplementation((directory: string) =>
            directory === '/proc/1001/task' ? ['1001', '1003'] : [directory.split('/')[2]],
        );
        readFileMock.mockImplementation((filename: string) => {
            if (filename === '/proc/1001/task/1003/children') {
                return '2001 ';
            }
            if (filename === '/proc/2001/task/2001/children') {
                return '3001 ';
            }

            return '';
        });

        runCompilers(['tsc.js']);
        compiler.emit('close', 2);

        expect(killSpy.mock.calls).toEqual([
            [3001, 'SIGTERM'],
            [2001, 'SIGTERM'],
            [1001, 'SIGTERM'],
        ]);
        expect(execFileSyncMock).not.toHaveBeenCalled();
    });

    it.each(['ENOENT', 'ESRCH'])(
        'handles Linux threads and processes disappearing with %s',
        (code) => {
            const compiler = createFakeProcess();

            Object.defineProperty(process, 'platform', { value: 'linux' });
            spawnMock.mockImplementation(() => compiler);
            readDirectoryMock.mockImplementation((directory: string) => {
                if (directory === '/proc/1001/task') {
                    return ['1001', '1003'];
                }

                throw Object.assign(new Error('Process has exited'), { code });
            });
            readFileMock.mockImplementation((filename: string) => {
                if (filename === '/proc/1001/task/1001/children') {
                    return '2001 ';
                }

                throw Object.assign(new Error('Thread has exited'), { code });
            });

            runCompilers(['tsc.js']);
            compiler.emit('close', 2);

            expect(killSpy.mock.calls).toEqual([
                [2001, 'SIGTERM'],
                [1001, 'SIGTERM'],
            ]);
            expect(execFileSyncMock).not.toHaveBeenCalled();
        },
    );

    it('removes cleanup listeners when every compiler closes successfully', () => {
        const compiler = createFakeProcess();

        spawnMock.mockImplementation(() => compiler);

        runCompilers(['client.js']);
        compiler.emit('close', 0);

        expect(killSpy).not.toHaveBeenCalled();
        expect(exitSpy).not.toHaveBeenCalled();
        stopListeners.forEach((listeners, event) => {
            expect(processEvents.listeners(event)).toEqual(listeners);
        });
    });

    it.each([
        ['SIGINT', 130],
        ['SIGTERM', 143],
    ] as const)('stops compiler trees on %s', (signal, exitCode) => {
        spawnMock.mockImplementation(() => createFakeProcess());

        runCompilers(['tsc.js']);
        const onSignal = processEvents
            .listeners(signal)
            .find((listener) => !stopListeners.get(signal)?.includes(listener));

        onSignal?.();

        expect(killSpy).toHaveBeenCalledWith(1001, 'SIGTERM');
        expect(exitSpy).toHaveBeenCalledWith(exitCode);
    });

    it('cleans up the Windows process tree when the CLI exits', () => {
        Object.defineProperty(process, 'platform', { value: 'win32' });
        spawnMock.mockImplementation(() => createFakeProcess());

        runCompilers(['tsc.js']);
        const onExit = processEvents
            .listeners('exit')
            .find((listener) => !stopListeners.get('exit')?.includes(listener));

        onExit?.(1);

        expect(execFileSyncMock).toHaveBeenCalledWith('taskkill', ['/pid', '1001', '/T', '/F'], {
            stdio: 'ignore',
        });
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it('kills the compiler process tree on Windows', () => {
        const compiler = createFakeProcess();

        Object.defineProperty(process, 'platform', { value: 'win32' });
        spawnMock.mockImplementation(() => compiler);

        runCompilers(['tsc.js']);
        compiler.emit('close', 2);

        expect(execFileSyncMock).toHaveBeenCalledWith('taskkill', ['/pid', '1001', '/T', '/F'], {
            stdio: 'ignore',
        });
        expect(killSpy).not.toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(2);
    });
});
