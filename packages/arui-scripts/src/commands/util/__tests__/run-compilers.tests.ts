import { spawn } from 'child_process';
import { EventEmitter } from 'events';

import { runCompilers } from '../run-compilers';

jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('fs-extra', () => ({ pathExistsSync: () => false, removeSync: jest.fn() }));
jest.mock('../../../configs/app-configs', () => ({
    configs: { cwd: '/app', serverOutputPath: '/app/.build' },
}));

type FakeProcess = EventEmitter & { kill: jest.Mock };

function createFakeProcess(): FakeProcess {
    return Object.assign(new EventEmitter(), { kill: jest.fn() });
}

describe('runCompilers', () => {
    const spawnMock = spawn as jest.Mock;
    let exitSpy: jest.SpyInstance;

    beforeEach(() => {
        spawnMock.mockReset();
        exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('spawns every compiler in project directory', () => {
        spawnMock.mockImplementation(createFakeProcess);

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
    });

    it('stops all compilers and exits with 1 when compiler fails to start', () => {
        const processes = [createFakeProcess(), createFakeProcess()];

        spawnMock.mockImplementation(() => processes[spawnMock.mock.calls.length - 1]);

        runCompilers(['client.js', 'server.js']);
        processes[0].emit('error', new Error('spawn node ENOENT'));

        expect(processes[0].kill).toHaveBeenCalled();
        expect(processes[1].kill).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('exits with compiler exit code when it closes with error', () => {
        const compiler = createFakeProcess();

        spawnMock.mockImplementation(() => compiler);

        runCompilers(['client.js']);
        compiler.emit('close', 2);

        expect(exitSpy).toHaveBeenCalledWith(2);
    });

    it('fails the build when compiler is killed by a signal', () => {
        // при убийстве сигналом (например, из-за нехватки памяти) в close приходит null,
        // а process.exit(null) завершает сборку с кодом 0, то есть успехом
        const compiler = createFakeProcess();

        spawnMock.mockImplementation(() => compiler);

        runCompilers(['client.js']);
        compiler.emit('close', null, 'SIGABRT');

        expect(compiler.kill).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(exitSpy).not.toHaveBeenCalledWith(0);
        expect(exitSpy).not.toHaveBeenCalledWith(null);
    });

    it('keeps running when a compiler closes successfully', () => {
        const compiler = createFakeProcess();

        spawnMock.mockImplementation(() => compiler);

        runCompilers(['client.js']);
        compiler.emit('close', 0);

        expect(compiler.kill).not.toHaveBeenCalled();
        expect(exitSpy).not.toHaveBeenCalled();
    });
});
