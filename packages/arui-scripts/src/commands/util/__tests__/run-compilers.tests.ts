import { type ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';

import fs from 'fs-extra';

import { runCompilers } from '../run-compilers';

jest.mock('child_process', () => ({ spawn: jest.fn() }));
jest.mock('fs-extra', () => ({ pathExistsSync: jest.fn(), removeSync: jest.fn() }));
jest.mock('../../../configs/app-configs', () => ({
    configs: { cwd: '/project', serverOutputPath: '/project/.build' },
}));

describe('parallel build processes', () => {
    let children: Array<EventEmitter & { kill: jest.Mock }>;

    beforeEach(() => {
        jest.clearAllMocks();
        children = [];
        jest.mocked(spawn).mockImplementation(() => {
            const child = Object.assign(new EventEmitter(), { kill: jest.fn() });

            children.push(child);

            return child as unknown as ChildProcess;
        });
        jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit intercepted');
        });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('cleans previous output and starts compiler scripts with inherited output', () => {
        jest.mocked(fs.pathExistsSync).mockReturnValue(true);
        runCompilers(['client.js', ['tsc.js', '--watch']]);
        expect(fs.removeSync).toHaveBeenCalledWith('/project/.build');
        expect(spawn).toHaveBeenNthCalledWith(1, 'node', ['client.js'], { stdio: 'inherit' });
        expect(spawn).toHaveBeenNthCalledWith(2, 'node', ['tsc.js', '--watch'], {
            stdio: 'inherit',
            cwd: '/project',
        });
    });
    test('does not remove nonexistent output or terminate other successful compilers', () => {
        jest.mocked(fs.pathExistsSync).mockReturnValue(false);
        runCompilers(['client.js', 'server.js']);
        children[0].emit('close', 0);
        expect(fs.removeSync).not.toHaveBeenCalled();
        expect(children[1].kill).not.toHaveBeenCalled();
        expect(process.exit).not.toHaveBeenCalled();
    });
    test('terminates all compilers and preserves a failing exit code', () => {
        runCompilers(['client.js', 'server.js']);
        expect(() => children[0].emit('close', 2)).toThrow('exit intercepted');
        children.forEach((child) => expect(child.kill).toHaveBeenCalledTimes(1));
        expect(process.exit).toHaveBeenCalledWith(2);
    });
});
