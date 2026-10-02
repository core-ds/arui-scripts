import { createModuleLoader } from '../create-module-loader';
import { fetchResources } from '../utils/fetch-resources';
import { getCompatModule, getModule } from '../utils/get-module';
import * as reactLegacyCompat from '../utils/react-legacy-compat';

jest.mock('../utils/fetch-resources', () => ({
    fetchResources: jest.fn(async () => []),
    getResourcesTargetNodes: jest.fn(() => []),
}));

jest.mock('../utils/get-module', () => ({
    getModule: jest.fn(),
    getCompatModule: jest.fn(),
}));

describe('createModuleLoader: совместимость легаси-модулей с React 19', () => {
    let enableLegacyReactCompatSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        enableLegacyReactCompatSpy = jest
            .spyOn(reactLegacyCompat, 'enableLegacyReactCompat')
            .mockReturnValue(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('включает шим на время выполнения ресурсов compat-модуля и выключает после', async () => {
        const order: string[] = [];

        enableLegacyReactCompatSpy.mockImplementation(() => {
            order.push('enable');

            return () => {
                order.push('restore');
            };
        });
        (fetchResources as jest.Mock).mockImplementationOnce(async () => {
            order.push('fetch');
        });

        const getModuleResources = jest.fn().mockResolvedValue({
            scripts: ['assets/module.js'],
            styles: [],
            moduleState: { baseUrl: '' },
            mountMode: 'compat',
        });

        (getCompatModule as jest.Mock).mockReturnValueOnce({});

        const loader = createModuleLoader<unknown, unknown>({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
        });

        await loader({ getResourcesParams: undefined });

        expect(order).toEqual(['enable', 'fetch', 'restore']);
        expect(enableLegacyReactCompatSpy).toHaveBeenCalledTimes(1);
    });

    it('не включает шим для default (MF) модулей', async () => {
        const getModuleResources = jest.fn().mockResolvedValue({
            scripts: ['assets/remoteEntry.js'],
            styles: [],
            moduleState: { baseUrl: '' },
            mountMode: 'default',
        });

        (getModule as jest.Mock).mockResolvedValueOnce({});

        const loader = createModuleLoader<unknown, unknown>({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
        });

        await loader({ getResourcesParams: undefined });

        expect(enableLegacyReactCompatSpy).not.toHaveBeenCalled();
    });

    it('восстанавливает шим даже если fetchResources упал', async () => {
        const restore = jest.fn();

        enableLegacyReactCompatSpy.mockReturnValue(restore);
        (fetchResources as jest.Mock).mockRejectedValueOnce(new Error('boom'));

        const getModuleResources = jest.fn().mockResolvedValue({
            scripts: ['assets/module.js'],
            styles: [],
            moduleState: { baseUrl: '' },
            mountMode: 'compat',
        });

        const loader = createModuleLoader<unknown, unknown>({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
        });

        await expect(loader({ getResourcesParams: undefined })).rejects.toThrow('boom');

        expect(restore).toHaveBeenCalledTimes(1);
    });

    it('не включает шим повторно, когда ресурсы взяты из кеша', async () => {
        const getModuleResources = jest.fn().mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'compat',
        });

        (getCompatModule as jest.Mock).mockReturnValue({});

        const loader = createModuleLoader<unknown, unknown>({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
            resourcesCache: 'single-item',
        });

        await loader({ getResourcesParams: { a: 1 } });
        await loader({ getResourcesParams: { a: 1 } });

        expect(enableLegacyReactCompatSpy).toHaveBeenCalledTimes(1);
    });
});
