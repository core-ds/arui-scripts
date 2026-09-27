import { type ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

import { hasProjectVitestConfig, runVitest } from '../run-vitest';

jest.mock('child_process', () => ({ spawn: jest.fn() }));

describe('Vitest process runner', () => {
    let child: EventEmitter;

    beforeEach(() => {
        child = new EventEmitter();
        jest.mocked(spawn).mockReturnValue(child as ChildProcess);
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test.each(['js', 'mjs', 'ts', 'cjs', 'mts', 'cts'])(
        'finds vitest.config.%s in the project',
        (extension) => {
            jest.spyOn(fs, 'existsSync').mockImplementation(
                (filename) => filename === path.join('/project', `vitest.config.${extension}`),
            );
            expect(hasProjectVitestConfig('/project')).toBe(true);
        },
    );
    test('uses the bundled config when the project has none, without shell interpolation', async () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const promise = runVitest({ args: ['--coverage', 'test with spaces'], cwd: '/project' });

        expect(spawn).toHaveBeenLastCalledWith(
            process.execPath,
            [
                expect.stringMatching(/vitest\.mjs$/),
                'run',
                '--config',
                expect.stringMatching(/configs\/vitest\/config\.js$/),
                '--coverage',
                'test with spaces',
            ],
            { stdio: 'inherit', shell: false },
        );
        child.emit('close', 0);
        await expect(promise).resolves.toBe(0);
    });
    test('keeps project configuration and forwards nonzero exit codes', async () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const promise = runVitest({ args: ['--reporter=verbose'] });

        expect(spawn).toHaveBeenLastCalledWith(
            process.execPath,
            [expect.any(String), 'run', '--reporter=verbose'],
            expect.any(Object),
        );
        child.emit('close', 2);
        await expect(promise).resolves.toBe(2);
    });
    test('rejects spawn errors', async () => {
        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const promise = runVitest({ args: [] });
        const error = new Error('spawn failed');

        child.emit('error', error);
        await expect(promise).rejects.toBe(error);
    });
});
