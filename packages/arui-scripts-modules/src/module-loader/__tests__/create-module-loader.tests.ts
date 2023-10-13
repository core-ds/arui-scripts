import { createModuleLoader } from '../create-module-loader';
import { getConsumerCounter } from '../utils/consumers-counter';
import { getCompatModule,getModule } from '../utils/get-module';
import { mountModuleResources } from '../utils/mount-module-resources';
import * as cleanGlobal from '../utils/clean-global';
import * as domUtils from '../utils/dom-utils';

jest.mock('../utils/mount-module-resources', () => ({
    mountModuleResources: jest.fn(() => []),
}));

jest.mock('../utils/get-module', () => ({
    getModule: jest.fn(),
    getCompatModule: jest.fn(),
}));

jest.mock('../utils/consumers-counter', () => ({
    getConsumerCounter: jest.fn(() => ({
        increase: jest.fn(),
        decrease: jest.fn(),
        getCounter: jest.fn(),
    })),
}));

describe('createModuleLoader', () => {
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

    it('should pass correct params to mountModuleResources', async () => {
        const getModuleResources = jest.fn();
        const mountModuleResourcesMock = mountModuleResources as jest.Mock;
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

        expect(mountModuleResourcesMock).toHaveBeenCalledWith({
            resourcesTargetNode: undefined,
            cssTargetSelector: '.target',
            moduleConsumersCounter: expect.anything(),
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

        expect(getModule).toHaveBeenCalledWith('AppName', 'test');
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
            'Module test is not available'
        );
    });

    describe('module consumers counter', () => {
        it('should increase module consumers counter on mount', async () => {
            const getModuleResources = jest.fn();
            const loader = createModuleLoader({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
            });
            const moduleConsumersCounter = (getConsumerCounter as jest.Mock).mock.results[0].value;

            getModuleResources.mockResolvedValue({
                scripts: [],
                styles: [],
                moduleState: {},
                mountMode: 'default',
                appName: 'AppName',
            });

            (getModule as jest.Mock).mockResolvedValueOnce({});

            await loader({ getResourcesParams: undefined });

            expect(moduleConsumersCounter.increase).toHaveBeenCalledWith('test');
        });

        it('should decrease module consumers counter on unmount', async () => {
            const getModuleResources = jest.fn();
            const loader = createModuleLoader({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
            });
            const moduleConsumersCounter = (getConsumerCounter as jest.Mock).mock.results[0].value;

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

            expect(moduleConsumersCounter.decrease).toHaveBeenCalledWith('test');
        });

        it('should remove module resources if module consumers counter is 0', async () => {
            jest.spyOn(domUtils, 'removeModuleResources');
            jest.spyOn(cleanGlobal, 'cleanGlobal');
            const getModuleResources = jest.fn();
            const loader = createModuleLoader({
                moduleId: 'test',
                hostAppId: 'test',
                getModuleResources,
            });
            const moduleConsumersCounter = (getConsumerCounter as jest.Mock).mock.results[0].value;

            getModuleResources.mockResolvedValue({
                scripts: [],
                styles: [],
                moduleState: {},
                mountMode: 'default',
                appName: 'AppName',
            });

            (getModule as jest.Mock).mockResolvedValueOnce({});
            moduleConsumersCounter.getCounter.mockReturnValueOnce(0);

            const { unmount } = await loader({ getResourcesParams: undefined });

            unmount();

            expect(moduleConsumersCounter.getCounter).toHaveBeenCalledWith('test');
            expect(domUtils.removeModuleResources).toHaveBeenCalledWith({ moduleId: 'test', targetNodes: [] });
            expect(cleanGlobal.cleanGlobal).toHaveBeenCalledWith('test');
        });
    });
});
