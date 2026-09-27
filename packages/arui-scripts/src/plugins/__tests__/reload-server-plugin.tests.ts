import cluster, { type Worker } from 'cluster';
import path from 'path';

import { type Compiler } from '@rspack/core';

import { ReloadServerPlugin } from '../reload-server-plugin';

jest.mock('cluster', () => ({ setupMaster: jest.fn(), on: jest.fn(), fork: jest.fn() }));

describe('server reload after compilation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(process, 'kill').mockReturnValue(true);
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    function setup(script?: string) {
        const plugin = script ? new ReloadServerPlugin({ script }) : new ReloadServerPlugin();
        const tapAsync = jest.fn();

        plugin.apply({ hooks: { afterEmit: { tapAsync } } } as unknown as Compiler);
        const online = jest.mocked(cluster.on).mock.calls[0][1] as (worker: Worker) => void;
        const emit = tapAsync.mock.calls[0][1] as (
            compilation: object,
            callback: () => void,
        ) => void;

        return { plugin, online, emit };
    }
    test('uses the configured script and waits until the replacement worker is online', () => {
        const { emit, online } = setup('dist/server.js');

        expect(cluster.setupMaster).toHaveBeenCalledWith({ exec: path.resolve('dist/server.js') });
        const done = jest.fn();

        emit({}, done);
        expect(cluster.fork).toHaveBeenCalledTimes(1);
        expect(done).not.toHaveBeenCalled();
        online({ process: { pid: 101 } } as Worker);
        expect(done).toHaveBeenCalledTimes(1);
    });
    test('terminates previous workers before replacing them', () => {
        const { plugin, emit, online } = setup();

        expect(cluster.setupMaster).toHaveBeenCalledWith({ exec: path.resolve('server.js') });
        online({ process: { pid: 101 } } as Worker);
        online({ process: {} } as Worker);
        emit({}, jest.fn());
        expect(process.kill).toHaveBeenCalledTimes(1);
        expect(process.kill).toHaveBeenCalledWith(101, 'SIGTERM');
        expect(plugin.workers).toEqual([]);
    });
    test('starts a replacement even if terminating a stale worker fails', () => {
        const { emit, online } = setup();

        online({ process: { pid: 101 } } as Worker);
        jest.mocked(process.kill).mockImplementation(() => {
            throw new Error('ESRCH');
        });
        emit({}, jest.fn());
        expect(console.warn).toHaveBeenCalledWith('Unable to kill process #101');
        expect(cluster.fork).toHaveBeenCalledTimes(1);
    });
});
