import { createModuleFetcher } from '../create-module-fetcher';
import { fetchAppManifest } from '../utils/fetch-app-manifest';

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
