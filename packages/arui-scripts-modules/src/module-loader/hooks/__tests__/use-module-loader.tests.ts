import { renderHook } from '@testing-library/react-hooks';

import { useModuleLoader } from '../use-module-loader';

describe('useModuleLoader', () => {
    it('should return the module and resources when the loader resolves', async () => {
        const moduleExport = { foo: 'bar' };
        const resources = { css: ['styles.css'], js: ['script.js'] };
        const loader = jest.fn()
            .mockResolvedValue({ module: moduleExport, moduleResources: resources });
        const loaderParams = { id: 'my-module' };

        const { result, waitForNextUpdate } = renderHook(() =>
            useModuleLoader({ loader: loader as any, loaderParams }),
        );

        expect(result.current.loadingState).toBe('pending');
        expect(result.current.module).toBeUndefined();
        expect(result.current.resources).toBeUndefined();

        await waitForNextUpdate();

        expect(result.current.loadingState).toBe('fulfilled');
        expect(result.current.module).toBe(moduleExport);
        expect(result.current.resources).toBe(resources);

        expect(loader).toHaveBeenCalledWith({
            getResourcesParams: loaderParams,
            abortSignal: expect.any(AbortSignal),
        });
    });

    it('should return an error when the loader rejects', async () => {
        const error = new Error('Failed to load module');
        const loader = jest.fn().mockRejectedValue(error);
        const loaderParams = { id: 'my-module' };

        const { result, waitForNextUpdate } = renderHook(() =>
            useModuleLoader({ loader, loaderParams }),
        );

        expect(result.current.loadingState).toBe('pending');
        expect(result.current.module).toBeUndefined();
        expect(result.current.resources).toBeUndefined();

        await waitForNextUpdate();

        expect(result.current.loadingState).toBe('rejected');
        expect(result.current.module).toBeUndefined();
        expect(result.current.resources).toBeUndefined();
    });

    it('should not call the loader again when the loader params change', async () => {
        const moduleExport = { foo: 'bar' };
        const resources = { css: ['styles.css'], js: ['script.js'] };
        const loader = jest.fn()
            .mockResolvedValue({ module: moduleExport, moduleResources: resources });
        const loaderParams = { id: 'my-module' };

        const { result, waitForNextUpdate, rerender } = renderHook(
            (props) => useModuleLoader(props),
            { initialProps: { loader, loaderParams } },
        );

        await waitForNextUpdate();

        expect(result.current.loadingState).toBe('fulfilled');
        expect(loader).toHaveBeenCalledWith({
            getResourcesParams: loaderParams,
            abortSignal: expect.any(AbortSignal),
        });

        rerender({ loader, loaderParams: { id: 'my-module' } });

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should call unmount function from loader when component unmounts', async () => {
        const unmount = jest.fn();
        const loader = jest.fn().mockResolvedValue({ unmount });
        const loaderParams = { id: 'my-module' };

        const { unmount: unmountHook, waitForNextUpdate } = renderHook(() =>
            useModuleLoader({ loader, loaderParams }),
        );

        await waitForNextUpdate();

        unmountHook();

        expect(unmount).toHaveBeenCalled();
    });
});
