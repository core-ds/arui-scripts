import path from 'path';

import { rspack } from '@rspack/core';
import { RspackDevServer } from '@rspack/dev-server';
import getPort from 'get-port';

import { devServerConfig } from '../../../configs/dev-server';
import { statsOptions } from '../../../configs/stats-options';
import { handleCompilationResult } from '../error-formatter';
import { printBuildError } from '../print-build-error';
import { runClientDevServer } from '../run-client-dev-server';

jest.mock('@rspack/core', () => ({ rspack: jest.fn() }));
jest.mock('@rspack/dev-server', () => ({ RspackDevServer: jest.fn() }));
jest.mock('get-port', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../../configs/dev-server', () => ({ devServerConfig: { port: 3000, hot: true } }));
jest.mock('../../../configs/stats-options', () => ({
    statsOptions: { colors: false, errors: true },
}));
jest.mock('../error-formatter', () => ({ handleCompilationResult: jest.fn() }));
jest.mock('../print-build-error', () => ({ printBuildError: jest.fn() }));

function createHook<Args extends unknown[]>() {
    const tap = jest.fn<void, [string, (...args: Args) => void]>();

    return {
        tap,
        call: (...args: Args) => {
            tap.mock.calls.forEach(([, callback]) => callback(...args));
        },
    };
}

function createCompiler() {
    return {
        hooks: {
            compile: createHook<[]>(),
            invalid: createHook<[string | null]>(),
            done: createHook<[object]>(),
            failed: createHook<[Error]>(),
        },
    };
}

describe('runClientDevServer', () => {
    const start = jest.fn();
    let compiler: ReturnType<typeof createCompiler>;

    beforeEach(() => {
        jest.clearAllMocks();
        compiler = createCompiler();
        (rspack as unknown as jest.Mock).mockReturnValue(compiler);
        (RspackDevServer as unknown as jest.Mock).mockImplementation(() => ({ start }));
        jest.mocked(getPort).mockResolvedValue(3001);
        start.mockResolvedValue(undefined);
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('exit');
        });
    });

    afterEach(() => jest.restoreAllMocks());

    it('starts on the selected free port without mutating dev server settings', async () => {
        const config = { name: 'app' };

        await runClientDevServer(config);
        expect(rspack).toHaveBeenCalledWith(config);
        expect(getPort).toHaveBeenCalledWith({ port: 3000, host: '0.0.0.0' });
        expect(RspackDevServer).toHaveBeenCalledWith({ ...devServerConfig, port: 3001 }, compiler);
        expect(devServerConfig.port).toBe(3000);
        expect(start).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('http://0.0.0.0:3001'));
    });

    it('waits for startup before reporting the server URL', async () => {
        let finish = () => {};

        start.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    finish = resolve;
                }),
        );
        const running = runClientDevServer({});

        await new Promise<void>((resolve) => {
            setImmediate(resolve);
        });
        expect(start).toHaveBeenCalledTimes(1);
        expect(console.log).not.toHaveBeenCalled();
        finish();
        await running;
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Dev server running at'));
    });

    it('registers diagnostics for every compiler and preserves configuration names', async () => {
        const remote = createCompiler();
        const multiCompiler = { compilers: [compiler, remote] };

        (rspack as unknown as jest.Mock).mockReturnValue(multiCompiler);
        const configurations = [{}, { name: 'remote' }];

        await runClientDevServer(configurations);
        expect(rspack).toHaveBeenCalledWith(configurations);
        expect(RspackDevServer).toHaveBeenCalledWith(expect.any(Object), multiCompiler);
        const stats = { hash: 'build' };

        compiler.hooks.done.call(stats);
        remote.hooks.done.call(stats);
        expect(handleCompilationResult).toHaveBeenNthCalledWith(1, stats, 'Client', {
            stats: statsOptions,
        });
        expect(handleCompilationResult).toHaveBeenNthCalledWith(2, stats, 'remote', {
            stats: statsOptions,
        });
        for (const item of [compiler, remote]) {
            item.hooks.compile.call();
            item.hooks.invalid.call(path.join(process.cwd(), 'src/app.ts'));
            item.hooks.invalid.call(null);
            const error = new Error('Compilation failed');

            item.hooks.failed.call(error);
            expect(printBuildError).toHaveBeenCalledWith(error, { showStack: true });
        }
        const output = jest.mocked(console.log).mock.calls.flat().join('\n');

        for (const name of ['Client', 'remote']) {
            expect(output).toContain(`${name}: Compiling...`);
            expect(output).toContain(`${name}: src/app.ts changed`);
            expect(output).toContain(`${name}: unknown changed`);
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining(`${name} compilation failed:`),
            );
        }
    });

    it('does not start a server when no port is available', async () => {
        jest.mocked(getPort).mockResolvedValue(0);
        await runClientDevServer({});
        expect(RspackDevServer).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Could not find an available port'),
        );
    });

    it.each(['port', 'start'])('reports a %s failure and exits unsuccessfully', async (stage) => {
        const error = new Error('Startup failed');

        if (stage === 'port') jest.mocked(getPort).mockRejectedValue(error);
        else start.mockRejectedValue(error);
        await expect(runClientDevServer({})).rejects.toThrow('exit');
        expect(printBuildError).toHaveBeenCalledWith(error, { showStack: true });
        expect(process.exit).toHaveBeenCalledWith(1);
        expect(console.log).not.toHaveBeenCalledWith(
            expect.stringContaining('Dev server running at'),
        );
    });
});
