import { getAppManifest, readAssetsManifest } from '../../read-assets-manifest';
import { createGetModulesMethod } from '../create-get-modules-method';

jest.mock('../../read-assets-manifest', () => ({
    readAssetsManifest: jest.fn(),
    getAppManifest: jest.fn(),
}));

describe('createGetModulesMethod', () => {
    it('should return method description with correct http method and path', () => {
        const { method, path } = createGetModulesMethod({});

        expect(method).toBe('POST');
        expect(path).toBe('/api/getModuleResources');
    });

    it('should throw error if requested module not found in modules config', async () => {
        const { handler } = createGetModulesMethod({});

        await expect(
            handler({ moduleId: 'test', hostAppId: 'test', params: undefined }),
        ).rejects.toThrowError('Module test not found');
    });

    it('should return correct response for compat module', async () => {
        (readAssetsManifest as any).mockImplementationOnce(() =>
            Promise.resolve({
                js: ['vendor.js', 'main.js'],
                css: ['vendor.css', 'main.css'],
            }),
        );
        (getAppManifest as any).mockImplementationOnce(() =>
            Promise.resolve({
                __metadata__: {
                    name: 'module-app-name',
                },
            }),
        );
        const getModuleState = jest.fn(() => Promise.resolve({ baseUrl: '' }));
        const { handler } = createGetModulesMethod({
            test: {
                mountMode: 'compat',
                getModuleState,
                version: '1.0.0',
            },
        });

        const result = await handler({ moduleId: 'test', hostAppId: 'test', params: undefined });

        expect(result).toEqual({
            mountMode: 'compat',
            moduleVersion: '1.0.0',
            scripts: ['vendor.js', 'main.js'],
            styles: ['vendor.css', 'main.css'],
            moduleState: { baseUrl: '', hostAppId: 'test' },
            appName: 'module-app-name',
            esmMode: false,
        });

        expect(getModuleState).toBeCalledWith({ moduleId: 'test', hostAppId: 'test' });
    });

    it('should return correct response for default module', async () => {
        (getAppManifest as any).mockImplementationOnce(() =>
            Promise.resolve({
                __metadata__: {
                    name: 'module-app-name',
                },
            }),
        );

        (readAssetsManifest as any).mockImplementationOnce(() => Promise.resolve({
            js: ['assets/remoteEntry.js'],
        }));

        const getModuleState = jest.fn(() => Promise.resolve({ baseUrl: '' }));
        const { handler } = createGetModulesMethod({
            test: {
                mountMode: 'default',
                getModuleState,
                version: '1.0.0',
            },
        });

        const result = await handler({ moduleId: 'test', hostAppId: 'test', params: undefined });

        expect(result).toEqual({
            mountMode: 'default',
            moduleVersion: '1.0.0',
            scripts: ['assets/remoteEntry.js'],
            styles: [],
            moduleState: { baseUrl: '', hostAppId: 'test' },
            appName: 'module-app-name',
            esmMode: false,
        });

        expect(getModuleState).toBeCalledWith({ moduleId: 'test', hostAppId: 'test' });
    });

    it('should set esm mode when build metadata created with vite', async () => {
        (getAppManifest as any).mockImplementationOnce(() =>
            Promise.resolve({
                __metadata__: {
                    name: 'module-app-name',
                    vite: true,
                },
            }),
        );

        (readAssetsManifest as any).mockImplementationOnce(() => Promise.resolve({
            js: ['assets/remoteEntry.js'],
        }));

        const getModuleState = jest.fn(() => Promise.resolve({ baseUrl: '' }));
        const { handler } = createGetModulesMethod({
            test: {
                mountMode: 'default',
                getModuleState,
                version: '1.0.0',
            },
        });

        const result = await handler({ moduleId: 'test', hostAppId: 'test', params: undefined });

        expect(result).toEqual({
            mountMode: 'default',
            moduleVersion: '1.0.0',
            scripts: ['assets/remoteEntry.js'],
            styles: [],
            moduleState: { baseUrl: '', hostAppId: 'test' },
            appName: 'module-app-name',
            esmMode: true,
        });

        expect(getModuleState).toBeCalledWith({ moduleId: 'test', hostAppId: 'test' });
    });
});
