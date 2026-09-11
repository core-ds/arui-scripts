import { createModuleFetcher } from '../create-module-fetcher';
import { fetchAppManifest } from '../utils/fetch-app-manifest';
import { LOCAL_OVERRIDE_STORAGE_KEY } from '../utils/local-override';

jest.mock('../utils/fetch-app-manifest');

describe('createModuleFetcher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch the app manifest and return module resources', async () => {
        const mockManifest = {
            __metadata__: {
                version: '1.0',
                name: 'Test App',
            },
            module1: {
                js: 'module1.js',
                css: 'module1.css',
                mode: 'compat',
            },
        };

        (fetchAppManifest as jest.Mock).mockResolvedValue(mockManifest);

        const baseUrl = 'http://example.com';
        const assetsUrl = '/assets/webpack-assets.json';
        const moduleFetcher = createModuleFetcher({ baseUrl, assetsUrl });

        const moduleId = 'module1';
        const hostAppId = 'app1';

        const expectedModuleResources = {
            scripts: ['module1.js'],
            styles: ['module1.css'],
            moduleVersion: '1.0',
            appName: 'Test App',
            mountMode: 'compat',
            moduleState: {
                baseUrl: 'http://example.com',
                hostAppId: 'app1',
            },
        };

        const moduleResources = await moduleFetcher({ moduleId, hostAppId, params: undefined });

        expect(fetchAppManifest).toHaveBeenCalledWith(
            'http://example.com/assets/webpack-assets.json',
        );
        expect(moduleResources).toEqual(expectedModuleResources);
    });

    it('should throw an error if module is not found in the manifest', async () => {
        const mockManifest = {
            __metadata__: {
                version: '1.0',
                name: 'Test App',
            },
        };

        (fetchAppManifest as jest.Mock).mockResolvedValue(mockManifest);

        const baseUrl = 'http://example.com';
        const assetsUrl = '/assets/webpack-assets.json';
        const moduleFetcher = createModuleFetcher({ baseUrl, assetsUrl });

        const moduleId = 'module1';
        const hostAppId = 'app1';

        await expect(moduleFetcher({ moduleId, hostAppId, params: undefined })).rejects.toThrow(
            'Module module1 not found in manifest from http://example.com/assets/webpack-assets.json',
        );

        expect(fetchAppManifest).toHaveBeenCalledWith(
            'http://example.com/assets/webpack-assets.json',
        );
    });
});

describe('createModuleFetcher with local override', () => {
    const mockManifest = {
        __metadata__: {
            version: '1.0',
            name: 'Test App',
        },
        module1: {
            js: 'module1.js',
            css: 'module1.css',
            mode: 'compat',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
    });

    it('uses the override base url when allowLocalOverride is enabled', async () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ module1: 'http://localhost:8080' }),
        );
        (fetchAppManifest as jest.Mock).mockResolvedValue(mockManifest);

        const moduleFetcher = createModuleFetcher({
            baseUrl: 'http://example.com',
            allowLocalOverride: true,
        });

        const moduleResources = await moduleFetcher({
            moduleId: 'module1',
            hostAppId: 'app1',
            params: undefined,
        });

        expect(fetchAppManifest).toHaveBeenCalledWith(
            'http://localhost:8080/assets/webpack-assets.json',
        );
        expect(moduleResources.moduleState.baseUrl).toBe('http://localhost:8080');
    });

    it('falls back to baseUrl when no override exists', async () => {
        (fetchAppManifest as jest.Mock).mockResolvedValue(mockManifest);

        const moduleFetcher = createModuleFetcher({
            baseUrl: 'http://example.com',
            allowLocalOverride: true,
        });

        const moduleResources = await moduleFetcher({
            moduleId: 'module1',
            hostAppId: 'app1',
            params: undefined,
        });

        expect(fetchAppManifest).toHaveBeenCalledWith(
            'http://example.com/assets/webpack-assets.json',
        );
        expect(moduleResources.moduleState.baseUrl).toBe('http://example.com');
    });

    it('ignores override when allowLocalOverride is disabled', async () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ module1: 'http://localhost:8080' }),
        );
        (fetchAppManifest as jest.Mock).mockResolvedValue(mockManifest);

        const moduleFetcher = createModuleFetcher({ baseUrl: 'http://example.com' });

        const moduleResources = await moduleFetcher({
            moduleId: 'module1',
            hostAppId: 'app1',
            params: undefined,
        });

        expect(fetchAppManifest).toHaveBeenCalledWith(
            'http://example.com/assets/webpack-assets.json',
        );
        expect(moduleResources.moduleState.baseUrl).toBe('http://example.com');
    });

    it('uses the effective manifest url in the not-found error', async () => {
        window.localStorage.setItem(
            LOCAL_OVERRIDE_STORAGE_KEY,
            JSON.stringify({ missing: 'http://localhost:8080' }),
        );
        (fetchAppManifest as jest.Mock).mockResolvedValue({
            __metadata__: { version: '1.0', name: 'Test App' },
        });

        const moduleFetcher = createModuleFetcher({
            baseUrl: 'http://example.com',
            allowLocalOverride: true,
        });

        await expect(
            moduleFetcher({ moduleId: 'missing', hostAppId: 'app1', params: undefined }),
        ).rejects.toThrow(
            'Module missing not found in manifest from http://localhost:8080/assets/webpack-assets.json',
        );
    });
});
