import { type ModuleResources } from '../types';

const modulesCache: Record<string, Record<string, ModuleResources>> = {};

export function getModulesCache() {
    return modulesCache;
}

const modulesCleanupMethods: Record<string, () => void> = {};

export function cleanupModule(moduleId: string) {
    if (modulesCache[moduleId]) {
        delete modulesCache[moduleId];
    }

    if (modulesCleanupMethods[moduleId]) {
        modulesCleanupMethods[moduleId]();
        delete modulesCleanupMethods[moduleId];
    }
}

export function cleanupModulesCache() {
    Object.keys(modulesCache).forEach((key) => {
        delete modulesCache[key];
    });

    Object.keys(modulesCleanupMethods).forEach((key) => {
        modulesCleanupMethods[key]();
        delete modulesCleanupMethods[key];
    });
}

export function addCleanupMethod(moduleId: string, cleanupFn: () => void) {
    modulesCleanupMethods[moduleId] = cleanupFn;
}
