import * as React from 'react';
import { render, waitFor } from '@testing-library/react';

import { createLazyMounter } from '../create-lazy-mounter';
import { useModuleMountTarget } from '../hooks/use-module-mount-target';
import { unwrapDefaultExport } from '../utils/unwrap-default-export';

jest.mock('../hooks/use-module-mount-target');
jest.mock('../utils/unwrap-default-export');

const mockUseModuleMountTarget = useModuleMountTarget as jest.Mock;
const mockUnwrapDefaultExport = unwrapDefaultExport as jest.Mock;

describe('createLazyMounter', () => {
    const mockMount = jest.fn();
    const mockModuleUnmount = jest.fn();
    const mockResourceUnmount = jest.fn();
    const mockLoader = jest.fn().mockResolvedValue({
        module: { mount: mockMount, unmount: mockModuleUnmount },
        moduleResources: { moduleState: { testState: 'mockState' } },
        unmount: mockResourceUnmount,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseModuleMountTarget.mockReturnValue({
            mountTargetNode: document.createElement('div'),
            afterTargetMountCallback: jest.fn(),
            cssTargetSelector: 'head',
        });
        mockUnwrapDefaultExport.mockImplementation((mod: unknown) => mod);
    });

    it('should load module and mount it with correct parameters', async () => {
        const loaderParams = { testParam: 'param' };
        const runParams = { testRunParam: 'runParam' };

        const mounter = createLazyMounter({
            loader: mockLoader,
            loaderParams,
        });

        const { default: Component } = await mounter();

        render(<Component {...runParams} />);

        await waitFor(() => {
            expect(mockLoader).toHaveBeenCalledWith({
                getResourcesParams: loaderParams,
                useShadowDom: false,
            });
            expect(mockMount).toHaveBeenCalledWith(expect.any(HTMLDivElement), runParams, {
                testState: 'mockState',
            });
        });
    });

    it('should handle default exports correctly', async () => {
        const moduleWithDefault = { default: { mount: mockMount, unmount: mockModuleUnmount } };
        const specialLoader = jest.fn().mockResolvedValue({
            module: moduleWithDefault,
            moduleResources: { moduleState: {} },
            unmount: mockResourceUnmount,
        });

        mockUnwrapDefaultExport.mockImplementation(
            (module: unknown) => (module as { default: unknown }).default,
        );

        const mounter = createLazyMounter({ loader: specialLoader });
        const { default: Component } = await mounter();

        const emptyParams: Record<string, unknown> = {};

        render(<Component {...emptyParams} />);

        await waitFor(() => {
            expect(mockUnwrapDefaultExport).toHaveBeenCalledWith(moduleWithDefault);
            expect(mockMount).toHaveBeenCalled();
        });
    });

    it('should not mount when target node is missing', async () => {
        mockUseModuleMountTarget.mockReturnValueOnce({
            mountTargetNode: undefined,
            afterTargetMountCallback: jest.fn(),
            cssTargetSelector: 'head',
        });

        const mounter = createLazyMounter({ loader: mockLoader });
        const { default: Component } = await mounter();

        const emptyParams: Record<string, unknown> = {};

        render(<Component {...emptyParams} />);

        expect(mockMount).not.toHaveBeenCalled();
    });

    it('should handle undefined loader params', async () => {
        const mounter = createLazyMounter({ loader: mockLoader });

        await mounter();

        expect(mockLoader).toHaveBeenCalledWith({
            getResourcesParams: undefined,
            useShadowDom: false,
        });
    });

    it('should call update instead of re-mount on runParams change when supported', async () => {
        const mockUpdate = jest.fn();
        const updatableLoader = jest.fn().mockResolvedValue({
            module: { mount: mockMount, unmount: mockModuleUnmount, update: mockUpdate },
            moduleResources: { moduleState: { testState: 'mockState' } },
            unmount: mockResourceUnmount,
        });

        const mounter = createLazyMounter({ loader: updatableLoader });
        const { default: Component } = await mounter();

        const { rerender } = render(<Component value='a' />);

        await waitFor(() => {
            expect(mockMount).toHaveBeenCalledTimes(1);
        });

        rerender(<Component value='b' />);

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith(
                expect.any(HTMLDivElement),
                { value: 'b' },
                { testState: 'mockState' },
            );
        });
        expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it('should re-mount on runParams change when update is not supported', async () => {
        const mounter = createLazyMounter({ loader: mockLoader });
        const { default: Component } = await mounter();

        const { rerender } = render(<Component value='a' />);

        await waitFor(() => {
            expect(mockMount).toHaveBeenCalledTimes(1);
        });

        rerender(<Component value='b' />);

        await waitFor(() => {
            expect(mockMount).toHaveBeenCalledTimes(2);
        });
    });

    it('unmounts the module and loader resources when the component unmounts', async () => {
        const moduleUnmount = jest.fn();
        const resourceUnmount = jest.fn();
        const loader = jest.fn().mockResolvedValue({
            module: { mount: mockMount, unmount: moduleUnmount },
            moduleResources: { moduleState: { testState: 'mockState' } },
            unmount: resourceUnmount,
        });
        const mounter = createLazyMounter({ loader });
        const { default: Component } = await mounter();

        const { unmount } = render(<Component value='a' />);

        await waitFor(() => {
            expect(mockMount).toHaveBeenCalledTimes(1);
        });

        unmount();

        expect(moduleUnmount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        await waitFor(() => {
            expect(resourceUnmount).toHaveBeenCalledTimes(1);
        });
    });

    it('unmounts before re-mounting when update is unavailable', async () => {
        const moduleUnmount = jest.fn();
        const loader = jest.fn().mockResolvedValue({
            module: { mount: mockMount, unmount: moduleUnmount },
            moduleResources: { moduleState: { testState: 'mockState' } },
            unmount: jest.fn(),
        });
        const mounter = createLazyMounter({ loader });
        const { default: Component } = await mounter();

        const { rerender } = render(<Component value='a' />);

        await waitFor(() => {
            expect(mockMount).toHaveBeenCalledTimes(1);
        });

        rerender(<Component value='b' />);

        await waitFor(() => {
            expect(mockMount).toHaveBeenCalledTimes(2);
        });

        expect(moduleUnmount).toHaveBeenCalledWith(expect.any(HTMLDivElement));
        expect(moduleUnmount.mock.invocationCallOrder[0]).toBeLessThan(
            mockMount.mock.invocationCallOrder[1],
        );
    });
});
