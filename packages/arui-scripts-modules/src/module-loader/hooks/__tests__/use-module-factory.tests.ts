import { renderHook, waitFor } from '@testing-library/react';

import { useModuleFactory } from '../use-module-factory';

describe('useModuleFactory', () => {
    it('should return factory execution result when the loader resolves', async () => {
        const moduleExport = jest.fn();
        const loader = jest.fn()
            .mockResolvedValue({ module: moduleExport, moduleResources: { moduleState: 'serverState' } });
        const loaderParams = { id: 'my-module' };
        const runParams = { foo: 'bar' };

        const { result } = renderHook(() =>
            useModuleFactory({ loader, loaderParams, runParams }),
        );

        expect(result.current.loadingState).toBe('pending');
        expect(result.current.module).toBeUndefined();

        await waitFor(() => {
            expect(result.current.loadingState).toBe('fulfilled');
        });

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

        const { result } = renderHook(() =>
            useModuleFactory({ loader, loaderParams: {}, getFactoryParams }),
        );

        await waitFor(() => {
            expect(result.current.loadingState).toBe('fulfilled');
        });

        expect(getFactoryParams).toHaveBeenCalledWith('serverState');
    });

    it('should return an error when the loader rejects', async () => {
        const error = new Error('Failed to load module');
        const loader = jest.fn(() => Promise.reject(error));
        const loaderParams = { id: 'my-module' };

        const { result } = renderHook(() =>
            useModuleFactory({ loader, loaderParams }),
        );

        expect(result.current.loadingState).toBe('pending');
        expect(result.current.module).toBeUndefined();

        await waitFor(() => {
            expect(result.current.loadingState).toBe('rejected');
        });

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

        const { unmount: unmountHook, result } = renderHook(() =>
            useModuleFactory({ loader, loaderParams }),
        );

        await waitFor(() => {
            expect(result.current.loadingState).toBe('fulfilled');
        });
        unmountHook();

        expect(unmount).toHaveBeenCalled();
    });
});
