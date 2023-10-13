import { renderHook } from '@testing-library/react-hooks';

import { FactoryModule } from '../../module-types';
import { executeModuleFactory,useModuleFactory } from '../use-module-factory';

describe('useModuleFactory', () => {
    it('should return factory execution result when the loader resolves', async () => {
        const moduleExport = jest.fn();
        const loader = jest.fn()
            .mockResolvedValue({ module: moduleExport, moduleResources: { moduleState: 'serverState' } });
        const loaderParams = { id: 'my-module' };
        const runParams = { foo: 'bar' };

        const { result, waitForNextUpdate } = renderHook(() =>
            useModuleFactory({ loader, loaderParams, runParams }),
        );

        expect(result.current.loadingState).toBe('pending');
        expect(result.current.module).toBeUndefined();

        await waitForNextUpdate();

        expect(result.current.loadingState).toBe('fulfilled');
        expect(loader).toHaveBeenCalledWith({
            getResourcesParams: loaderParams,
            abortSignal: expect.any(AbortSignal),
        });
        expect(moduleExport).toHaveBeenCalledWith(runParams, 'serverState');
    });

    it('should run getFactoryParams with the server state when provided', async () => {
        const loader = jest.fn()
            .mockResolvedValue({ module: jest.fn(), moduleResources: { moduleState: 'serverState' } });
        const getFactoryParams = jest.fn((serverState) => serverState);

        const { waitForNextUpdate } = renderHook(() =>
            useModuleFactory({ loader, loaderParams: {}, getFactoryParams }),
        );

        await waitForNextUpdate();

        expect(getFactoryParams).toHaveBeenCalledWith('serverState');
    });

    it('should return an error when the loader rejects', async () => {
        const error = new Error('Failed to load module');
        const loader = jest.fn(() => Promise.reject(error));
        const loaderParams = { id: 'my-module' };

        const { result, waitForNextUpdate } = renderHook(() =>
            useModuleFactory({ loader, loaderParams }),
        );

        expect(result.current.loadingState).toBe('pending');
        expect(result.current.module).toBeUndefined();

        await waitForNextUpdate();

        expect(result.current.loadingState).toBe('rejected');
        expect(result.current.module).toBeUndefined();
        expect(loader).toHaveBeenCalledWith({
            getResourcesParams: loaderParams,
            abortSignal: expect.any(AbortSignal),
        });
    });

    it('should call unmount function of a loader when the component unmounts', async () => {
        const unmount = jest.fn();
        const loader = jest.fn()
            .mockResolvedValue({ module: jest.fn(), moduleResources: { moduleState: 'serverState' }, unmount });
        const loaderParams = { id: 'my-module' };

        const { unmount: unmountHook, waitForNextUpdate } = renderHook(() =>
            useModuleFactory({ loader, loaderParams }),
        );

        await waitForNextUpdate();
        unmountHook();

        expect(unmount).toHaveBeenCalled();
    });
});

describe('executeModuleFactory', () => {
    it('should work when module have default export', async () => {
        const mockModule = {
            default: jest.fn().mockResolvedValue('result'),
        };

        const result = await executeModuleFactory(
            mockModule as unknown as FactoryModule<unknown, unknown>,
            { baseUrl: 'example.com', hostAppId: 'app' },
            'runParams',
        );

        expect(mockModule.default).toHaveBeenCalledWith('runParams', { baseUrl: 'example.com', hostAppId: 'app' });
        expect(result).toBe('result');
    });

    it('should work when module is a function', async () => {
        const mockModule = jest.fn().mockResolvedValue('result');

        const result = await executeModuleFactory(
            mockModule as unknown as FactoryModule<unknown, unknown>,
            { baseUrl: 'example.com', hostAppId: 'app' },
            'runParams',
        );

        expect(mockModule).toHaveBeenCalledWith('runParams', { baseUrl: 'example.com', hostAppId: 'app' });
        expect(result).toBe('result');
    });

    it('should work when module has a factory field', async () => {
        const mockModule = {
            factory: jest.fn().mockResolvedValue('result'),
        };

        const result = await executeModuleFactory(
            mockModule as unknown as FactoryModule<unknown, unknown>,
            { baseUrl: 'example.com', hostAppId: 'app' },
            'runParams',
        );

        expect(mockModule.factory).toHaveBeenCalledWith('runParams', { baseUrl: 'example.com', hostAppId: 'app' });
        expect(result).toBe('result');
    });

    it('should throw an error when module has no default export, factory field or is a function', () => {
        const mockModule = {};

        const res = executeModuleFactory(
            mockModule as unknown as FactoryModule<unknown, unknown>,
            { baseUrl: 'example.com', hostAppId: 'app' },
            'runParams',
        );

        expect(res).rejects.toThrowError();
    });
});
