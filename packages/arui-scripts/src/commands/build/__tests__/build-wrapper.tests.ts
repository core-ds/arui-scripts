import { rspack, type Stats } from '@rspack/core';

import build from '../build-wrapper';

jest.mock('@rspack/core', () => ({ rspack: jest.fn() }));

describe('production build result', () => {
    const oldEnv = process.env;

    beforeEach(() => {
        process.env = { ...oldEnv };
        delete process.env.CI;
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        process.env = oldEnv;
        jest.restoreAllMocks();
    });

    function compilation(errors: string[] = [], warnings: string[] = [], fatal?: Error) {
        const stats = { toJson: jest.fn(() => ({ errors, warnings })) };

        jest.mocked(rspack).mockReturnValue({
            run: (callback: (error: Error | undefined, stats: Stats) => void) =>
                callback(fatal, stats as unknown as Stats),
        } as unknown as ReturnType<typeof rspack>);

        return stats;
    }

    test('returns statistics, warnings and previous sizes on success', async () => {
        const stats = compilation([], ['warning']);
        const previous = { main: 100 };

        await expect(build({}, previous)).resolves.toEqual({
            stats,
            warnings: ['warning'],
            previousFileSizes: previous,
        });
    });
    test('rejects fatal compiler errors without losing the original cause', async () => {
        const error = new Error('compiler crashed');

        compilation([], [], error);
        await expect(build({})).rejects.toBe(error);
    });
    test('reports only the first compilation error', async () => {
        compilation(['first failure', 'second failure']);
        await expect(build({})).rejects.toThrow(/^first failure$/);
    });
    test.each(['true', '1', 'TRUE'])('fails on warnings when CI=%s', async (ci) => {
        process.env.CI = ci;
        compilation([], ['warning']);
        await expect(build({})).rejects.toThrow('warning');
    });
    test.each(['false', 'FALSE', ''])('allows warnings when CI=%s', async (ci) => {
        process.env.CI = ci;
        compilation([], ['warning']);
        await expect(build({})).resolves.toMatchObject({ warnings: ['warning'] });
    });
    test('successful builds without warnings also pass on CI', async () => {
        process.env.CI = 'true';
        compilation();
        await expect(build({})).resolves.toMatchObject({ warnings: [] });
    });
});
