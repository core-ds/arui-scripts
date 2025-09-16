import { type AppConfigs } from '../app-configs/types';

export function getPolyfills(config: AppConfigs) {
    const polyfills: string[] = [];

    if (config.clientPolyfillsEntry && Array.isArray(config.clientPolyfillsEntry)) {
        polyfills.push(...config.clientPolyfillsEntry);
    } else if (config.clientPolyfillsEntry) {
        polyfills.push(config.clientPolyfillsEntry);
    }

    return polyfills;
}
