/* eslint-disable global-require */
const mockClientConfig = { name: 'client', plugins: [] };
const mockBudgets = { initialJs: '100 KB' };
const mockBuild = jest.fn();
const mockCheckBuildSizeBudgets = jest.fn();
const mockEnableRsdoctor = jest.fn();
const mockWriteRsdoctorSnapshot = jest.fn();

jest.mock('../build-wrapper', () => ({ __esModule: true, default: mockBuild }));
jest.mock('../../../configs/rspack.client.prod', () => ({ rspackClientConfig: mockClientConfig }));
jest.mock('../../../configs/app-configs', () => ({
    configs: { appSrc: '/app/src', buildSizeBudgets: mockBudgets },
}));
jest.mock('../../util/load-browserslist', () => ({ loadBrowserslist: jest.fn() }));
jest.mock('../../util/client-assets-sizes', () => ({ printAssetsSizes: jest.fn() }));
jest.mock('../../util/build-size-budgets', () => ({
    ...jest.requireActual('../../util/build-size-budgets'),
    checkBuildSizeBudgets: mockCheckBuildSizeBudgets,
}));
jest.mock('../../util/rsdoctor-snapshot', () => ({
    enableRsdoctor: mockEnableRsdoctor,
    writeRsdoctorSnapshot: mockWriteRsdoctorSnapshot,
}));

const stats = { hash: 'client-stats' };

async function buildClient() {
    require('../client');

    // все зависимости замоканы и резолвятся сразу, поэтому сборка завершается за один тик
    await new Promise(setImmediate);
}

describe('build client', () => {
    let exitSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
        exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
        mockBuild.mockResolvedValue({ stats, warnings: [] });
    });

    afterEach(() => {
        delete process.env.ARUI_SCRIPTS_RSDOCTOR_OUTPUT;
        jest.restoreAllMocks();
    });

    it('attaches Rsdoctor before compiling and writes its snapshot after the build', async () => {
        const snapshot = { directory: '/app/rsdoctor/current' };

        process.env.ARUI_SCRIPTS_RSDOCTOR_OUTPUT = 'rsdoctor/current';
        mockEnableRsdoctor.mockResolvedValue(snapshot);

        await buildClient();

        expect(mockEnableRsdoctor).toHaveBeenCalledWith(
            mockClientConfig,
            'rsdoctor/current',
            '/app/src',
        );
        expect(mockWriteRsdoctorSnapshot).toHaveBeenCalledWith(snapshot);

        const [enabledAt] = mockEnableRsdoctor.mock.invocationCallOrder;
        const [compiledAt] = mockBuild.mock.invocationCallOrder;
        const [writtenAt] = mockWriteRsdoctorSnapshot.mock.invocationCallOrder;

        expect(enabledAt).toBeLessThan(compiledAt);
        expect(compiledAt).toBeLessThan(writtenAt);
        expect(exitSpy).not.toHaveBeenCalled();
    });

    it('checks build size budgets for the client output', async () => {
        mockEnableRsdoctor.mockResolvedValue(undefined);

        await buildClient();

        expect(mockCheckBuildSizeBudgets).toHaveBeenCalledWith(stats, mockBudgets, 'client');
        expect(mockWriteRsdoctorSnapshot).not.toHaveBeenCalled();
        expect(exitSpy).not.toHaveBeenCalled();
    });
});
