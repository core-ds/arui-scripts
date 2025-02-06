import { act, cleanup, renderHook } from '@testing-library/react';

import { useModuleMountTarget } from '../use-module-mount-target';

jest.mock('../use-id', () => ({
    useId: jest.fn(() => 'unique-id'),
}));

describe('useModuleMountTarget', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('should return the mount target node when ref triggered', () => {
        const targetNode = document.createElement('div');
        const { result } = renderHook(
            () => useModuleMountTarget({})
        );

        expect(result.current.mountTargetNode).toBeUndefined();

        act(() => {
            result.current.afterTargetMountCallback(targetNode);
        });

        const realTarget = targetNode.children[0];

        expect(result.current.mountTargetNode).toBe(realTarget);
    });

    it('should use the provided createTargetNode function to create the mount target node', () => {
        const targetNode = document.createElement('div');
        const createTargetNode = jest.fn(() => targetNode);
        const { result } = renderHook(
            () => useModuleMountTarget({ createTargetNode })
        );

        expect(result.current.mountTargetNode).toBeUndefined();

        act(() => {
            result.current.afterTargetMountCallback(document.createElement('div'));
        });

        expect(result.current.mountTargetNode).toBe(targetNode);
        expect(createTargetNode).toHaveBeenCalled();
    });

    it('should create a shadow root when useShadowDom is true', () => {
        const targetNode = document.createElement('div');
        const realTarget = document.createElement('div');
        const { result } = renderHook(
            () => useModuleMountTarget({ useShadowDom: true, createTargetNode: () => realTarget })
        );

        expect(result.current.mountTargetNode).toBeUndefined();

        act(() => {
            result.current.afterTargetMountCallback(targetNode);
        });

        expect(targetNode.shadowRoot).toBeDefined();
        expect(targetNode.shadowRoot?.children[0].tagName).toBe('DIV');
        expect(targetNode.shadowRoot?.children[0].children[0]).toBe(realTarget);
        expect(result.current.cssTargetSelector).toBe('[data-module-mount-id="unique-id"]');
        expect(result.current.mountTargetNode).toBe(realTarget);
    });
});
