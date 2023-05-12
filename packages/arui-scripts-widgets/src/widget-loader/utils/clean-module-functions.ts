import type { WindowWithMountFunction, WindowWithUnmountFunction } from '../types';

export function cleanModuleFunctions(mountFunctionName?: string, unmountFunctionName?: string) {
    if (mountFunctionName) {
        delete (window as WindowWithMountFunction)?.[mountFunctionName];
    }
    if (unmountFunctionName) {
        delete (window as WindowWithUnmountFunction)?.[unmountFunctionName];
    }
}