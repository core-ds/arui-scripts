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
    const mockLoader = jest.fn().mockResolvedValue({
        module: { mount: mockMount },
        moduleResources: { moduleState: { testState: 'mockState' } },
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
        const moduleWithDefault = { default: { mount: mockMount } };
        const specialLoader = jest.fn().mockResolvedValue({
            module: moduleWithDefault,
            moduleResources: { moduleState: {} },
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
            module: { mount: mockMount, update: mockUpdate },
            moduleResources: { moduleState: { testState: 'mockState' } },
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
});
