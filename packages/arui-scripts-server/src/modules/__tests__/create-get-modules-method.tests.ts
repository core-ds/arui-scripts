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
        (readAssetsManifest as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                js: ['vendor.js', 'main.js'],
                css: ['vendor.css', 'main.css'],
            }),
        );
        (getAppManifest as jest.Mock).mockImplementationOnce(() =>
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
        });

        expect(getModuleState).toBeCalledWith({ moduleId: 'test', hostAppId: 'test' });
    });

    it('should return correct response for default module', async () => {
        (getAppManifest as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                __metadata__: {
                    name: 'module-app-name',
                },
            }),
        );

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
        });

        expect(getModuleState).toBeCalledWith({ moduleId: 'test', hostAppId: 'test' });
    });

    describe('ssr / renderToHtml', () => {
        beforeEach(() => {
            (getAppManifest as jest.Mock).mockImplementation(() =>
                Promise.resolve({
                    __metadata__: {
                        name: 'module-app-name',
                    },
                }),
            );
        });

        it('populates styles for default module from manifest css only on ssr request', async () => {
            (getAppManifest as jest.Mock).mockImplementation(() =>
                Promise.resolve({
                    __metadata__: { name: 'module-app-name' },
                    test: {
                        mode: 'default',
                        js: 'assets/remoteEntry.js',
                        css: ['assets/expose-a.css', 'assets/expose-b.css'],
                    },
                }),
            );
            const { handler } = createGetModulesMethod({
                test: {
                    mountMode: 'default',
                    getModuleState: () => Promise.resolve({ baseUrl: '' }),
                    version: '1.0.0',
                },
            });

            const ssrResult = await handler({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
                ssr: {},
            });

            expect(ssrResult.styles).toEqual(['assets/expose-a.css', 'assets/expose-b.css']);

            // без ssr ответ остаётся байт-в-байт прежним (css: [])
            const nonSsrResult = await handler({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
            });

            expect(nonSsrResult.styles).toEqual([]);
        });

        it('normalizes a single-string manifest css to an array on ssr request', async () => {
            (getAppManifest as jest.Mock).mockImplementation(() =>
                Promise.resolve({
                    __metadata__: { name: 'module-app-name' },
                    test: { mode: 'default', js: 'assets/remoteEntry.js', css: 'assets/one.css' },
                }),
            );
            const { handler } = createGetModulesMethod({
                test: {
                    mountMode: 'default',
                    getModuleState: () => Promise.resolve({ baseUrl: '' }),
                },
            });

            const result = await handler({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
                ssr: {},
            });

            expect(result.styles).toEqual(['assets/one.css']);
        });

        it('should not call renderToHtml when request has no ssr marker', async () => {
            const renderToHtml = jest.fn(() => '<div>html</div>');
            const { handler } = createGetModulesMethod({
                test: {
                    mountMode: 'default',
                    getModuleState: () => Promise.resolve({ baseUrl: '' }),
                    version: '1.0.0',
                    renderToHtml,
                },
            });

            const result = await handler({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
            });

            expect(renderToHtml).not.toBeCalled();
            expect(result).not.toHaveProperty('html');
        });

        it('should not include html when descriptor has no renderToHtml even if ssr requested', async () => {
            const { handler } = createGetModulesMethod({
                test: {
                    mountMode: 'default',
                    getModuleState: () => Promise.resolve({ baseUrl: '' }),
                    version: '1.0.0',
                },
            });

            const result = await handler({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
                ssr: { runParams: { name: 'Vasia' } },
            });

            expect(result).not.toHaveProperty('html');
        });

        it('should include html and pass moduleState + ssrRunParams to renderToHtml', async () => {
            const renderToHtml = jest.fn(() => '<div>Hello Vasia</div>');
            const { handler } = createGetModulesMethod({
                test: {
                    mountMode: 'default',
                    getModuleState: () => Promise.resolve({ baseUrl: '/base' }),
                    version: '1.0.0',
                    renderToHtml,
                },
            });

            const getResourcesRequest = {
                moduleId: 'test',
                hostAppId: 'host',
                params: undefined,
                ssr: { runParams: { name: 'Vasia' } },
            };

            const result = await handler(getResourcesRequest);

            expect(result).toHaveProperty('html', '<div>Hello Vasia</div>');
            expect(renderToHtml).toBeCalledWith({
                moduleState: { baseUrl: '/base', hostAppId: 'host' },
                ssrRunParams: { name: 'Vasia' },
                getResourcesRequest,
            });
        });

        it('should await async renderToHtml', async () => {
            const { handler } = createGetModulesMethod({
                test: {
                    mountMode: 'default',
                    getModuleState: () => Promise.resolve({ baseUrl: '' }),
                    renderToHtml: () => Promise.resolve('<div>async</div>'),
                },
            });

            const result = await handler({
                moduleId: 'test',
                hostAppId: 'host',
                params: undefined,
                ssr: {},
            });

            expect(result).toHaveProperty('html', '<div>async</div>');
        });

        it('should fall back without html when renderToHtml throws (default ssrErrorMode)', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
            const { handler } = createGetModulesMethod({
                test: {
                    mountMode: 'default',
                    getModuleState: () => Promise.resolve({ baseUrl: '' }),
                    renderToHtml: () => {
                        throw new Error('render failed');
                    },
                },
            });

            const result = await handler({
                moduleId: 'test',
                hostAppId: 'host',
                params: undefined,
                ssr: {},
            });

            expect(result).not.toHaveProperty('html');
            expect(consoleError).toBeCalled();
            consoleError.mockRestore();
        });

        it('should reject when renderToHtml throws and ssrErrorMode is reject', async () => {
            const { handler } = createGetModulesMethod(
                {
                    test: {
                        mountMode: 'default',
                        getModuleState: () => Promise.resolve({ baseUrl: '' }),
                        renderToHtml: () => {
                            throw new Error('render failed');
                        },
                    },
                },
                { ssrErrorMode: 'reject' },
            );

            await expect(
                handler({
                    moduleId: 'test',
                    hostAppId: 'host',
                    params: undefined,
                    ssr: {},
                }),
            ).rejects.toThrowError('render failed');
        });
    });
});
