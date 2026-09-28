import { rspack } from '@rspack/core';

import { statsOptions } from '../../../configs/stats-options';
import { handleCompilationResult } from '../error-formatter';
import { printBuildError } from '../print-build-error';
import { runServerWatchCompiler } from '../run-server-watch-compiler';

jest.mock('@rspack/core', () => ({ rspack: jest.fn() }));
jest.mock('../../../configs/app-configs', () => ({
    configs: { watchIgnorePath: ['node_modules'] },
}));
jest.mock('../../../configs/stats-options', () => ({
    statsOptions: { colors: false, warnings: false },
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

describe('runServerWatchCompiler', () => {
    const compiler = {
        hooks: {
            compile: createHook<[]>(),
            invalid: createHook<[string | null]>(),
            done: createHook<[object]>(),
            failed: createHook<[Error]>(),
        },
        watch: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (rspack as unknown as jest.Mock).mockReturnValue(compiler);
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });

    afterEach(() => jest.restoreAllMocks());

    it('starts watching the supplied configuration and ignores configured directories', () => {
        const config = { name: 'server' };

        runServerWatchCompiler(config);
        expect(rspack).toHaveBeenCalledWith(config);
        const [options, callback] = compiler.watch.mock.calls[0];

        expect(options.aggregateTimeout).toBe(50);
        expect(options.ignored.test('/project/node_modules/lib/index.js')).toBe(true);
        expect(options.ignored.test('/project/src/index.ts')).toBe(false);
        expect(callback).toEqual(expect.any(Function));
    });

    it('reports compilation and file changes, including an unknown file', () => {
        runServerWatchCompiler({});
        compiler.hooks.compile.call();
        compiler.hooks.invalid.call('/project/src/server.ts');
        compiler.hooks.invalid.call(null);
        const output = jest.mocked(console.log).mock.calls.flat().join('\n');

        expect(output).toContain('Server: Compiling...');
        expect(output).toContain('Server: /project/src/server.ts changed');
        expect(output).toContain('Server: unknown changed');
    });

    it('formats every rebuild with the configured stats options', () => {
        runServerWatchCompiler({});
        const first = { hash: 'first' };
        const second = { hash: 'second' };

        compiler.hooks.done.call(first);
        compiler.hooks.done.call(second);
        expect(handleCompilationResult).toHaveBeenNthCalledWith(1, first, 'Server', {
            stats: statsOptions,
        });
        expect(handleCompilationResult).toHaveBeenNthCalledWith(2, second, 'Server', {
            stats: statsOptions,
        });
    });

    it('prints fatal compiler errors with their stack', () => {
        runServerWatchCompiler({});
        const error = new Error('Compiler failed');

        compiler.hooks.failed.call(error);
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Server compilation failed:'),
        );
        expect(printBuildError).toHaveBeenCalledWith(error, { showStack: true });
        expect(handleCompilationResult).not.toHaveBeenCalled();
    });
});
