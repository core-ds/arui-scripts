import { rspack, type Stats } from '@rspack/core';

import { printCompilerOutput } from '../../start/print-compiler-output';
import { runServerWatchCompiler } from '../run-server-watch-compiler';

jest.mock('@rspack/core', () => ({ rspack: jest.fn() }));
jest.mock('../../../configs/app-configs', () => ({
    configs: { watchIgnorePath: ['node_modules', '.build'] },
}));
jest.mock('../../../configs/stats-options', () => ({ statsOptions: { colors: true } }));
jest.mock('chalk', () => ({ cyan: (text: string) => text }));

test('watches server sources, ignores build output and prints compile events', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    const compiler = {
        hooks: {
            compile: { tap: jest.fn() },
            invalid: { tap: jest.fn() },
            done: { tap: jest.fn() },
        },
        watch: jest.fn(),
    };

    jest.mocked(rspack).mockReturnValue(compiler as unknown as ReturnType<typeof rspack>);
    try {
        runServerWatchCompiler({ name: 'server' });
        const [options, callback] = compiler.watch.mock.calls[0];

        expect(options.aggregateTimeout).toBe(50);
        expect(options.ignored.test('/project/node_modules/pkg/a.js')).toBe(true);
        expect(options.ignored.test('/project/src/a.ts')).toBe(false);
        callback();
        compiler.hooks.compile.tap.mock.calls[0][1]();
        compiler.hooks.invalid.tap.mock.calls[0][1]();
        compiler.hooks.done.tap.mock.calls[0][1]({ toString: () => 'compiled\nwarning' });
        expect(log).toHaveBeenCalledWith('[Server] compiled\n[Server] warning');
        printCompilerOutput('Client', { toString: () => 'ready' } as Stats);
        expect(log).toHaveBeenCalledWith('[Client] ready');
    } finally {
        log.mockRestore();
    }
});
