import { createModuleLoader } from '../create-module-loader';
import * as cleanGlobal from '../utils/clean-global';
import * as domUtils from '../utils/dom-utils';
import { fetchResources } from '../utils/fetch-resources';
import { getCompatModule, getModule } from '../utils/get-module';
import { cleanupModulesCache } from '../utils/modules-cache';

jest.mock('../utils/fetch-resources', () => ({
    fetchResources: jest.fn(() => []),
    getResourcesTargetNodes: jest.fn(() => []),
}));

jest.mock('../utils/get-module', () => ({
    getModule: jest.fn(),
    getCompatModule: jest.fn(),
}));

describe('createModuleLoader', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a module loader', () => {
        const loader = createModuleLoader({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources: jest.fn(),
        });

        expect(loader).toBeDefined();
        expect(loader).toBeInstanceOf(Function);
    });

    it('should call getModuleResources with correct params', async () => {
        const getModuleResources = jest.fn();
        const loader = createModuleLoader<any, any>({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'default',
        });

        (getModule as jest.Mock).mockResolvedValueOnce({});

        await loader({ getResourcesParams: 'paramsToGetResources' });

        expect(getModuleResources).toHaveBeenCalledWith({
            moduleId: 'test',
            hostAppId: 'test',
            params: 'paramsToGetResources',
        });
    });

    it('calls the appropriate hooks when loading a module', async () => {
        const onBeforeResourcesMount = jest.fn();
        const onBeforeModuleMount = jest.fn();
        const onAfterModuleMount = jest.fn();
        const getModuleResources = jest.fn();

        const loader = createModuleLoader({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
            onBeforeResourcesMount,
            onBeforeModuleMount,
            onAfterModuleMount,
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'default',
        });

        (getModule as jest.Mock).mockResolvedValueOnce({});

        await loader({ getResourcesParams: undefined });

        expect(onBeforeResourcesMount).toHaveBeenCalled();
        expect(onBeforeModuleMount).toHaveBeenCalled();
        expect(onAfterModuleMount).toHaveBeenCalled();
    });

    it('should call appropriate hooks when unmounting a module', async () => {
        const onBeforeModuleUnmount = jest.fn();
        const onAfterModuleUnmount = jest.fn();
        const getModuleResources = jest.fn();

        const loader = createModuleLoader({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
            onBeforeModuleUnmount,
            onAfterModuleUnmount,
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'default',
        });

        (getModule as jest.Mock).mockResolvedValueOnce({});

        const { unmount } = await loader({ getResourcesParams: undefined });

        unmount();

        expect(onBeforeModuleUnmount).toHaveBeenCalled();
        expect(onAfterModuleUnmount).toHaveBeenCalled();
    });

    it('should pass correct params to fetchResources', async () => {
        const getModuleResources = jest.fn();
        const fetchResourcesMock = fetchResources as jest.Mock;
        const loader = createModuleLoader({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {
                baseUrl: 'https://example.com',
            },
            mountMode: 'default',
        });

        (getModule as jest.Mock).mockResolvedValueOnce({});

        await loader({ getResourcesParams: undefined, cssTargetSelector: '.target' });

        expect(fetchResourcesMock).toHaveBeenCalledWith({
            jsTargetNode: undefined,
            cssTargetNode: undefined,
            cssTargetSelector: '.target',
            moduleId: 'test',
            scripts: [],
            styles: [],
            baseUrl: 'https://example.com',
        });
    });

    it('should call getModule with correct params if mountMode is default', async () => {
        const getModuleResources = jest.fn();
        const loader = createModuleLoader({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
            sharedScope: 'exampleScope',
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'default',
            appName: 'AppName',
        });

        (getModule as jest.Mock).mockResolvedValueOnce({});

        await loader({ getResourcesParams: undefined });

        expect(getModule).toHaveBeenCalledWith('AppName', 'test', 'exampleScope');
    });

    it('should call getCompatModule with correct params if mountMode is compat', async () => {
        const getModuleResources = jest.fn();
        const loader = createModuleLoader({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'compat',
        });

        (getCompatModule as jest.Mock).mockReturnValueOnce({});

        await loader({ getResourcesParams: undefined });

        expect(getCompatModule).toHaveBeenCalledWith('test');
    });

    it('should throw an error if getModule returns falsy value', async () => {
        const getModuleResources = jest.fn();
        const loader = createModuleLoader({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'default',
            appName: 'AppName',
        });

        (getModule as jest.Mock).mockResolvedValueOnce(undefined);

        await expect(loader({ getResourcesParams: undefined })).rejects.toThrow(
            'Module test is not available',
        );
    });

    it('should not remove module resources if there is still someone consuming it', async () => {
        jest.spyOn(domUtils, 'removeModuleResources');
        jest.spyOn(cleanGlobal, 'cleanGlobal');
        const getModuleResources = jest.fn();
        const loader = createModuleLoader({
            moduleId: 'test',
            hostAppId: 'test',
            getModuleResources,
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'default',
            appName: 'AppName',
        });

        (getModule as jest.Mock).mockResolvedValue({});

        const { unmount } = await loader({ getResourcesParams: undefined });

        await loader({ getResourcesParams: undefined });

        unmount();

        expect(domUtils.removeModuleResources).not.toHaveBeenCalled();
        expect(cleanGlobal.cleanGlobal).not.toHaveBeenCalled();
    });

    it('should remove module resources if there is no one consuming it', async () => {
        jest.spyOn(domUtils, 'removeModuleResources');
        jest.spyOn(cleanGlobal, 'cleanGlobal');
        const getModuleResources = jest.fn();
        const loader = createModuleLoader({
            moduleId: 'unique-id',
            hostAppId: 'test',
            getModuleResources,
        });

        getModuleResources.mockResolvedValue({
            scripts: [],
            styles: [],
            moduleState: {},
            mountMode: 'default',
            appName: 'AppName',
        });

        (getModule as jest.Mock).mockResolvedValueOnce({});

        const { unmount } = await loader({ getResourcesParams: undefined });

        unmount();

        expect(domUtils.removeModuleResources).toHaveBeenCalledWith({
            moduleId: 'unique-id',
            targetNodes: [],
        });
        expect(cleanGlobal.cleanGlobal).toHaveBeenCalledWith('unique-id');
    });

    describe('aborting', () => {
        it('should reject with error if provided abortSignal is aborted', async () => {
            const getModuleResources = jest.fn();
            const loader = createModuleLoader({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
            });

            const abortController = new AbortController();

            abortController.abort();

            await expect(
                loader({ getResourcesParams: undefined, abortSignal: abortController.signal }),
            ).rejects.toThrow('Module test loading was aborted');

            expect(getModuleResources).not.toHaveBeenCalled();
        });

        it('should pass abortSignal to fetchResources', async () => {
            const getModuleResources = jest.fn();
            const loader = createModuleLoader({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
            });

            const abortController = new AbortController();

            getModuleResources.mockResolvedValue({
                scripts: [],
                styles: [],
                moduleState: {},
                mountMode: 'default',
            });

            (getModule as jest.Mock).mockResolvedValueOnce({});

            await loader({ getResourcesParams: undefined, abortSignal: abortController.signal });

            expect(fetchResources).toHaveBeenCalledWith({
                jsTargetNode: undefined,
                cssTargetNode: undefined,
                cssTargetSelector: undefined,
                moduleId: 'test',
                scripts: [],
                styles: [],
                baseUrl: undefined,
                abortSignal: abortController.signal,
            });
        });

        it('should remove module resources when receive abort signal', async () => {
            jest.spyOn(domUtils, 'removeModuleResources');
            jest.spyOn(cleanGlobal, 'cleanGlobal');
            const getModuleResources = jest.fn();
            const loader = createModuleLoader({
                moduleId: 'another-id',
                hostAppId: 'test',
                getModuleResources,
            });

            const abortController = new AbortController();

            getModuleResources.mockResolvedValue({
                scripts: [],
                styles: [],
                moduleState: {},
                mountMode: 'default',
                appName: 'AppName',
            });

            (getModule as jest.Mock).mockResolvedValueOnce({});

            await loader({ getResourcesParams: undefined, abortSignal: abortController.signal });

            abortController.abort();

            expect(domUtils.removeModuleResources).toHaveBeenCalledWith({
                moduleId: 'another-id',
                targetNodes: [],
            });
            expect(cleanGlobal.cleanGlobal).toHaveBeenCalledWith('another-id');
        });
    });

    describe('resourceCache: single-item', () => {
        beforeEach(() => {
            cleanupModulesCache();
        });

        it('should throw an error if useShadowDom and resourcesCache is single-item', async () => {
            const getModuleResources = jest.fn();
            const loader = createModuleLoader({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
                resourcesCache: 'single-item',
            });

            await expect(
                loader({ getResourcesParams: undefined, useShadowDom: true }),
            ).rejects.toThrow(
                'Загрузка модулей в shadow DOM при использовании `resourceCache: single-item` не поддерживается.',
            );
        });

        it('should cache module resources', async () => {
            const getModuleResources = jest.fn();
            const loader = createModuleLoader<unknown, Record<string, unknown>>({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
                resourcesCache: 'single-item',
            });

            getModuleResources.mockResolvedValueOnce({
                scripts: [],
                styles: [],
                moduleState: {},
                mountMode: 'default',
            });

            (getModule as jest.Mock).mockResolvedValue({});

            await loader({ getResourcesParams: { a: 1 } });
            await loader({ getResourcesParams: { a: 1 } });

            expect(getModuleResources).toHaveBeenCalledTimes(1);
        });

        it('should have different cache for different modules', async () => {
            const getModuleResources = jest.fn();
            const loader1 = createModuleLoader({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
            });

            const loader2 = createModuleLoader({
                moduleId: 'test2',
                hostAppId: 'test',
                getModuleResources,
            });

            getModuleResources.mockResolvedValue({
                scripts: [],
                styles: [],
                moduleState: {},
                mountMode: 'default',
            });

            (getModule as jest.Mock).mockResolvedValue({});

            await loader1({ getResourcesParams: undefined });
            await loader2({ getResourcesParams: undefined });

            expect(getModuleResources).toHaveBeenCalledTimes(2);
        });

        it('should not use cache when getResourcesParams changes', async () => {
            const getModuleResources = jest.fn();
            const loader = createModuleLoader<unknown, Record<string, unknown>>({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
                resourcesCache: 'single-item',
            });

            getModuleResources.mockResolvedValue({
                scripts: [],
                styles: [],
                moduleState: {},
                mountMode: 'default',
            });

            (getModule as jest.Mock).mockResolvedValue({});

            await loader({ getResourcesParams: { a: 1 } });
            await loader({ getResourcesParams: { b: 2 } });
            await loader({ getResourcesParams: { a: 1 } });

            expect(getModuleResources).toHaveBeenCalledTimes(3);
        });
    });
});
