/* eslint-disable global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require */
const flush = () =>
    new Promise<void>((resolve) => {
        setImmediate(resolve);
    });

describe('production command output', () => {
    const oldEnv = process.env;

    beforeEach(() => {
        process.env = { ...oldEnv };
        jest.resetModules();
        jest.doMock('../../../configs/rspack.client.prod', () => ({ webpackClientConfig: {} }));
        jest.doMock('../../../configs/rspack.server.prod', () => ({ webpackServerConfig: {} }));
        jest.doMock('../../util/load-browserslist', () => ({ loadBrowserslist: jest.fn() }));
        jest.doMock('../../util/client-assets-sizes', () => ({ printAssetsSizes: jest.fn() }));
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterEach(() => {
        process.env = oldEnv;
        jest.restoreAllMocks();
    });
    test.each(['client', 'server'])('%s prints success and warnings', async (target) => {
        process.env = { ...oldEnv };
        const stats = { name: 'stats' };
        const build = jest.fn().mockResolvedValue({ stats, warnings: ['warning from compiler'] });
        const sizes = jest.fn();

        jest.doMock('../build-wrapper', () => ({ __esModule: true, default: build }));
        jest.doMock('../../../configs/rspack.client.prod', () => ({
            webpackClientConfig: { name: 'app' },
        }));
        jest.doMock('../../../configs/rspack.server.prod', () => ({
            webpackServerConfig: { name: 'server' },
        }));
        jest.doMock('../../util/load-browserslist', () => ({ loadBrowserslist: jest.fn() }));
        jest.doMock('../../util/client-assets-sizes', () => ({ printAssetsSizes: sizes }));
        require(`../${target}`);
        await flush();
        expect(console.log).toHaveBeenCalledWith('warning from compiler');
        if (target === 'client') expect(sizes).toHaveBeenCalledWith(stats);
    });
    test.each(['client', 'server'])(
        '%s exits unsuccessfully after a build error',
        async (target) => {
            const error = new Error('build failed');
            const print = jest.fn();

            jest.doMock('../build-wrapper', () => ({
                __esModule: true,
                default: jest.fn().mockRejectedValue(error),
            }));
            jest.doMock('../../util/print-build-error', () => ({ printBuildError: print }));
            jest.spyOn(process, 'exit').mockImplementation((() => {}) as never);
            require(`../${target}`);
            await flush();
            expect(print).toHaveBeenCalledWith(error);
            expect(process.exit).toHaveBeenCalledWith(1);
        },
    );
    test.each([false, true])(
        'prints sizes for single/multiple client compilations (%s)',
        async (multiple) => {
            const stats = multiple
                ? { stats: [{ name: 'one' }, { name: 'two' }] }
                : { name: 'one' };
            const sizes = jest.fn();

            jest.doMock('../build-wrapper', () => ({
                __esModule: true,
                default: jest.fn().mockResolvedValue({ stats, warnings: [] }),
            }));
            jest.doMock('../../../configs/rspack.client.prod', () => ({
                webpackClientConfig: multiple ? [{}, { name: 'module' }] : {},
            }));
            jest.doMock('../../util/client-assets-sizes', () => ({ printAssetsSizes: sizes }));
            require('../client');
            await flush();
            expect(sizes.mock.calls.map(([value]) => value)).toEqual(
                multiple ? [{ name: 'one' }, { name: 'two' }] : [{ name: 'one' }],
            );
        },
    );
    test('prints successful server compilation', async () => {
        jest.doMock('../build-wrapper', () => ({
            __esModule: true,
            default: jest.fn().mockResolvedValue({ warnings: [] }),
        }));
        require('../server');
        await flush();
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('successfully'));
    });
});
