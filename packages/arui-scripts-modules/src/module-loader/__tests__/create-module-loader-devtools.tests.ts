import {
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    DEVTOOLS_VERSION,
    getDevtoolsModulesStore,
} from '../../devtools/store';
import { type ModuleLoadRecord } from '../../devtools/types';
import { createModuleLoader } from '../create-module-loader';
import { fetchResources } from '../utils/fetch-resources';
import { getCompatModule, getModule } from '../utils/get-module';
import { cleanupModulesCache } from '../utils/modules-cache';

jest.mock('../utils/fetch-resources', () => {
    const actual = jest.requireActual('../utils/fetch-resources');

    return {
        ...actual,
        fetchResources: jest.fn(async () => []),
        getResourcesTargetNodes: jest.fn(() => ({ js: document.head, css: document.head })),
    };
});

jest.mock('../utils/get-module', () => ({
    getModule: jest.fn(),
    getCompatModule: jest.fn(),
}));

const moduleResources = {
    scripts: ['module.js', 'vendor-module.js'],
    styles: ['module.css'],
    moduleVersion: '2.5.0',
    appName: 'exampleModules',
    mountMode: 'default',
    manifestUrl: 'http://localhost:8082/assets/webpack-assets.json',
    moduleState: { baseUrl: 'http://localhost:8082/', hostAppId: 'host' },
};

function getRecords(): ModuleLoadRecord[] {
    return getDevtoolsModulesStore()?.getSnapshot().loads ?? [];
}

function getLastRecord(): ModuleLoadRecord {
    const records = getRecords();

    if (records.length === 0) {
        throw new Error('devtools record is expected to exist');
    }

    return records[records.length - 1];
}

function createLoader(overrides: Record<string, unknown> = {}) {
    const getModuleResources: jest.Mock = jest.fn();

    getModuleResources.mockResolvedValue(moduleResources);

    return {
        getModuleResources,
        loader: createModuleLoader<unknown, undefined>({
            moduleId: 'header',
            hostAppId: 'host',
            getModuleResources,
            ...overrides,
        }),
    };
}

describe('createModuleLoader devtools reporting', () => {
    beforeEach(() => {
        delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
        sessionStorage.clear();
        cleanupModulesCache();
        (getModule as jest.Mock).mockResolvedValue({});
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY];
    });

    it('should record successful load with all known fields', async () => {
        const { loader } = createLoader({ shareScope: 'exampleScope' });

        await loader();

        expect(getLastRecord()).toMatchObject({
            moduleId: 'header',
            hostAppId: 'host',
            shareScope: 'exampleScope',
            status: 'loaded',
            containerId: 'exampleModules',
            moduleVersion: '2.5.0',
            mountMode: 'default',
            manifestUrl: 'http://localhost:8082/assets/webpack-assets.json',
            baseUrl: 'http://localhost:8082/',
            fromCache: false,
        });
    });

    it('should record absolute urls of module resources', async () => {
        const { loader } = createLoader();

        await loader();

        expect(getLastRecord()).toMatchObject({
            scripts: ['http://localhost:8082/module.js', 'http://localhost:8082/vendor-module.js'],
            styles: ['http://localhost:8082/module.css'],
        });
    });

    it('should absolutize resource urls against the page when baseUrl is not absolute', async () => {
        // Resource Timing хранит только полные адреса: относительный url в записи означал бы
        // «нет данных» даже для успешно загруженного ресурса
        const { loader, getModuleResources } = createLoader();

        getModuleResources.mockResolvedValue({
            ...moduleResources,
            moduleState: { ...moduleResources.moduleState, baseUrl: '' },
        });

        await loader();

        expect(getLastRecord()).toMatchObject({
            scripts: ['http://localhost/module.js', 'http://localhost/vendor-module.js'],
            styles: ['http://localhost/module.css'],
        });
    });

    it('should record stage timings', async () => {
        const { loader } = createLoader();

        await loader();

        const { timings } = getLastRecord();

        expect(Object.keys(timings)).toEqual(['fetch-manifest', 'fetch-resources']);
        expect(timings['fetch-resources']?.end).toEqual(expect.any(Number));
    });

    it('should default shareScope to default', async () => {
        const { loader } = createLoader();

        await loader();

        expect(getLastRecord().shareScope).toBe('default');
    });

    it('should create separate record for every load attempt', async () => {
        const { loader } = createLoader();

        await loader();
        await loader();

        const records = getRecords();

        expect(records).toHaveLength(2);
        expect(records[0].loadId).not.toBe(records[1].loadId);
    });

    it('should mark load as taken from cache and skip resources stage', async () => {
        const { loader } = createLoader({ resourcesCache: 'single-item' });

        await loader();
        await loader();

        const records = getRecords();

        expect(records[0].fromCache).toBe(false);
        expect(records[1].fromCache).toBe(true);
        expect(records[1].timings['fetch-resources']).toBeUndefined();
    });

    it('should record fetch-manifest failure', async () => {
        const { loader, getModuleResources } = createLoader();

        getModuleResources.mockRejectedValue(new Error('manifest is not reachable'));

        await expect(loader()).rejects.toThrow('manifest is not reachable');

        expect(getLastRecord()).toMatchObject({
            status: 'error',
            error: { stage: 'fetch-manifest', message: 'manifest is not reachable' },
        });
        expect(getLastRecord().finishedAt).toEqual(expect.any(Number));
    });

    it('should record fetch-resources failure', async () => {
        const { loader } = createLoader();

        (fetchResources as jest.Mock).mockRejectedValueOnce(new Error('script load error'));

        await expect(loader()).rejects.toThrow('script load error');

        expect(getLastRecord()).toMatchObject({
            status: 'error',
            error: { stage: 'fetch-resources', message: 'script load error' },
        });
    });

    // ошибки module-federation сегодня не доходят даже до onError, поэтому проверяем отдельно
    it('should record module federation failure that never reaches onError hook', async () => {
        const { loader } = createLoader();

        (getModule as jest.Mock).mockRejectedValueOnce(
            new Error('Cannot load external remote: exampleModules'),
        );

        await expect(loader()).rejects.toThrow('Cannot load external remote');

        expect(getLastRecord()).toMatchObject({
            status: 'error',
            error: { stage: 'container-get' },
        });
    });

    it('should record compat module failure', async () => {
        const { loader, getModuleResources } = createLoader();

        getModuleResources.mockResolvedValue({ ...moduleResources, mountMode: 'compat' });
        (getCompatModule as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Cannot load compat module: header');
        });

        await expect(loader()).rejects.toThrow('Cannot load compat module');

        // стадии module federation в compat-загрузке не участвуют - у неё своя, compat-get
        expect(getLastRecord()).toMatchObject({
            status: 'error',
            error: { stage: 'compat-get', message: 'Cannot load compat module: header' },
        });
    });

    it('should record missing compat module global at compat-get stage', async () => {
        const { loader, getModuleResources } = createLoader();

        getModuleResources.mockResolvedValue({ ...moduleResources, mountMode: 'compat' });
        (getCompatModule as jest.Mock).mockReturnValueOnce(undefined);

        await expect(loader()).rejects.toThrow('Module header is not available');

        expect(getLastRecord()).toMatchObject({
            status: 'error',
            error: { stage: 'compat-get' },
        });
    });

    it('should record compat-get timing for compat modules', async () => {
        const { loader, getModuleResources } = createLoader();

        getModuleResources.mockResolvedValue({ ...moduleResources, mountMode: 'compat' });
        (getCompatModule as jest.Mock).mockReturnValueOnce({ content: true });

        await loader();

        const record = getLastRecord();

        expect(record.status).toBe('loaded');
        expect(record.timings['compat-get']).toMatchObject({
            start: expect.any(Number),
            end: expect.any(Number),
        });
    });

    it('should record "module is not available" failure', async () => {
        const { loader } = createLoader();

        (getModule as jest.Mock).mockResolvedValueOnce(undefined);

        await expect(loader()).rejects.toThrow('Module header is not available');

        expect(getLastRecord()).toMatchObject({
            status: 'error',
            error: { stage: 'factory', message: 'Module header is not available' },
        });
    });

    it('should record unmount', async () => {
        const { loader } = createLoader();
        const { unmount } = await loader();

        expect(getLastRecord().status).toBe('loaded');

        unmount();

        expect(getLastRecord().status).toBe('unmounted');
    });

    it('should record unmount caused by abort signal', async () => {
        const { loader } = createLoader();
        const abortController = new AbortController();

        await loader({ abortSignal: abortController.signal });
        abortController.abort();

        expect(getLastRecord().status).toBe('unmounted');
    });

    it('should keep unmounted status when aborted load finishes on its own', async () => {
        const { loader } = createLoader();
        const abortController = new AbortController();

        // abort после старта, но до завершения: ресурсы уже сняты со страницы, при этом
        // сама загрузка доходит до конца - «loaded» в записи было бы враньём
        const promise = loader({ abortSignal: abortController.signal });

        abortController.abort();
        await promise;

        expect(getLastRecord().status).toBe('unmounted');
    });

    it('should instrument mount of mountable modules', async () => {
        const mount = jest.fn();

        (getModule as jest.Mock).mockResolvedValueOnce({ mount, unmount: jest.fn() });

        const { loader } = createLoader();
        const { module } = await loader();

        expect(getLastRecord().mountInstrumented).toBe(true);

        (module as { mount: (node: HTMLElement) => void }).mount(document.createElement('div'));

        expect(mount).toHaveBeenCalled();
        expect(getLastRecord().timings.mount?.end).toEqual(expect.any(Number));
    });

    it('should record mount failure', async () => {
        (getModule as jest.Mock).mockResolvedValueOnce({
            mount: () => {
                throw new Error('mount is broken');
            },
            unmount: jest.fn(),
        });

        const { loader } = createLoader();
        const { module } = await loader();

        expect(() =>
            (module as { mount: (node: HTMLElement) => void }).mount(document.createElement('div')),
        ).toThrow('mount is broken');

        expect(getLastRecord()).toMatchObject({
            status: 'error',
            error: { stage: 'mount', message: 'mount is broken' },
        });
    });

    it('should not mark plain modules as mount instrumented', async () => {
        const { loader } = createLoader();

        await loader();

        expect(getLastRecord().mountInstrumented).toBeUndefined();
    });

    it('should load module even when devtools store is completely broken', async () => {
        const broken = () => {
            throw new Error('devtools store is broken');
        };

        (globalThis as Record<string, unknown>)[DEVTOOLS_GLOBAL_KEY] = {
            version: DEVTOOLS_VERSION,
            [DEVTOOLS_MODULES_NAMESPACE]: {
                version: 1,
                getSnapshot: broken,
                subscribe: broken,
                writer: {
                    nextLoadId: () => 'broken',
                    addLoad: broken,
                    getLoad: broken,
                    updateLoad: broken,
                    addEvent: broken,
                },
            },
        };

        const { loader } = createLoader();

        await expect(loader()).resolves.toMatchObject({ module: {} });
    });
});
