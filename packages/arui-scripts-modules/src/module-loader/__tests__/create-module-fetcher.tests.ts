import { createModuleFetcher } from '../create-module-fetcher';
import { fetchAppManifest } from '../utils/fetch-app-manifest';
import { MODULE_OVERRIDES_STORAGE_KEY } from '../utils/module-overrides';

jest.mock('../utils/fetch-app-manifest');

describe('createModuleFetcher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
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

    describe('dev overrides', () => {
        beforeEach(() => {
            jest.spyOn(console, 'warn').mockImplementation(() => undefined);
            window.localStorage.setItem(
                MODULE_OVERRIDES_STORAGE_KEY,
                JSON.stringify({ module1: 'http://localhost:8081' }),
            );
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should take the manifest and the base url from the override', async () => {
            (fetchAppManifest as jest.Mock).mockResolvedValue({
                __metadata__: { version: '1.0', name: 'Test App' },
                module1: { js: 'module1.js', css: 'module1.css', mode: 'default' },
            });

            const moduleFetcher = createModuleFetcher({ baseUrl: 'http://example.com' });

            const moduleResources = await moduleFetcher({
                moduleId: 'module1',
                hostAppId: 'app1',
                params: undefined,
            });

            expect(fetchAppManifest).toHaveBeenCalledWith(
                'http://localhost:8081/assets/webpack-assets.json',
            );
            // baseUrl обязан быть переопределен: от него резолвятся относительные пути скриптов и стилей
            expect(moduleResources.moduleState.baseUrl).toBe('http://localhost:8081');
        });

        it('should not affect modules without an override', async () => {
            (fetchAppManifest as jest.Mock).mockResolvedValue({
                __metadata__: { version: '1.0', name: 'Test App' },
                module2: { js: 'module2.js', mode: 'default' },
            });

            const moduleFetcher = createModuleFetcher({ baseUrl: 'http://example.com' });

            const moduleResources = await moduleFetcher({
                moduleId: 'module2',
                hostAppId: 'app1',
                params: undefined,
            });

            expect(fetchAppManifest).toHaveBeenCalledWith(
                'http://example.com/assets/webpack-assets.json',
            );
            expect(moduleResources.moduleState.baseUrl).toBe('http://example.com');
        });
    });
});
