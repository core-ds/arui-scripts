import { cleanup,renderHook } from '@testing-library/react-hooks';

import { useModuleMountTarget } from '../use-module-mount-target';
import { useModuleMounter } from '../use-module-mounter';

jest.mock('../use-module-mount-target', () => ({
    useModuleMountTarget: jest.fn()
        .mockReturnValue({
            mountTargetNode: undefined,
            cssTargetSelector: undefined,
            afterTargetMountCallback: jest.fn()
        }),
}));

jest.useFakeTimers();

// Мы используем эту функцию чтобы промисы внутри хука не резолвились сразу и мы могли проверить состояние хука
function wait<T>(ms: number, value: T): Promise<T> {
    return new Promise(resolve => {
        setTimeout(() => resolve(value), ms)
    });
}

describe('useModuleMounter', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    const mountableModule = {
        mount: jest.fn(),
        unmount: jest.fn(),
    };
    const loader = jest.fn();
    const loaderParams = {};
    const runParams = {};
    const createTargetNode = jest.fn();
    const useShadowDom = false;
    const moduleServerState = {};

    it('mount module to element provided by useModuleMountTarget hook', async () => {
        const mountTargetNode = document.createElement('div');

        loader.mockReturnValue(wait(1, {
            module: mountableModule,
            moduleResources: {
                moduleState: moduleServerState,
            },
        }))

        const { result, waitForNextUpdate, rerender } = renderHook(() =>
            useModuleMounter({
                loader,
                loaderParams,
                runParams,
                createTargetNode,
                useShadowDom,
            })
        );

        expect(result.current.loadingState).toBe('unknown');

        (useModuleMountTarget as jest.Mock).mockReturnValueOnce({
            mountTargetNode,
            cssTargetSelector: 'head',
            afterTargetMountCallback: jest.fn(),
        });

        rerender();

        expect(result.current.loadingState).toBe('pending');
        expect(loader).toHaveBeenCalledWith({
            getResourcesParams: loaderParams,
            cssTargetSelector: 'head',
            abortSignal: expect.any(AbortSignal),
            useShadowDom: false,
        });

        jest.advanceTimersByTime(1);
        await waitForNextUpdate();

        expect(result.current.loadingState).toBe('fulfilled');
        expect(mountableModule.mount).toHaveBeenCalledWith(
            mountTargetNode,
            runParams,
            moduleServerState,
        );
    });

    it('should unmount module when component unmounts', async () => {
        const loaderUnmount = jest.fn();

        loader.mockResolvedValueOnce({
            module: mountableModule,
            moduleResources: {
                moduleState: moduleServerState,
            },
            unmount: loaderUnmount,
        });
        (useModuleMountTarget as jest.Mock).mockReturnValue({
            mountTargetNode: document.createElement('div'),
            cssTargetSelector: 'head',
            afterTargetMountCallback: jest.fn(),
        });

        const { unmount, waitForNextUpdate } = renderHook(() =>
            useModuleMounter({
                loader,
                loaderParams,
                runParams,
                createTargetNode,
                useShadowDom,
            })
        );

        await waitForNextUpdate();

        unmount();

        expect(mountableModule.unmount).toHaveBeenCalled();
        expect(loaderUnmount).toHaveBeenCalled();
    });

    it('should not call loader again when loader params change', async () => {
        loader.mockResolvedValueOnce({
            module: mountableModule,
            moduleResources: {
                moduleState: moduleServerState,
            },
            unmount: jest.fn(),
        });
        (useModuleMountTarget as jest.Mock).mockReturnValue({
            mountTargetNode: document.createElement('div'),
            cssTargetSelector: 'head',
            afterTargetMountCallback: jest.fn(),
        });

        const { rerender, waitForNextUpdate } = renderHook(
            (props) => useModuleMounter(props),
            {
                initialProps: {
                    loader,
                    loaderParams,
                    runParams,
                    createTargetNode,
                    useShadowDom,
                },
            }
        );

        await waitForNextUpdate();

        rerender({
            loader,
            loaderParams: { value: 'new' },
            runParams: { value: 'new' },
            createTargetNode,
            useShadowDom,
        });

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should return rejected state when loader rejects', async () => {
        const error = new Error('Failed to load module');

        loader.mockRejectedValueOnce(error);
        (useModuleMountTarget as jest.Mock).mockReturnValue({
            mountTargetNode: document.createElement('div'),
            cssTargetSelector: 'head',
            afterTargetMountCallback: jest.fn(),
        });

        const { result, waitForNextUpdate } = renderHook(() =>
            useModuleMounter({
                loader,
                loaderParams,
                runParams,
                createTargetNode,
                useShadowDom,
            })
        );

        expect(result.current.loadingState).toBe('pending');

        await waitForNextUpdate();

        expect(result.current.loadingState).toBe('rejected');
    });
});
