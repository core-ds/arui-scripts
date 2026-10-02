import {
    BUILD_SIZE_ASSET_TYPES,
    BUILD_SIZE_METRICS,
    type BuildSizeAssetType,
    type BuildSizeMetric,
} from './types';

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAssetType(value: string): value is BuildSizeAssetType {
    return (BUILD_SIZE_ASSET_TYPES as readonly string[]).includes(value);
}

function isMetric(value: string): value is BuildSizeMetric {
    return (BUILD_SIZE_METRICS as readonly string[]).includes(value);
}

export function validateBuildSizeBudgets(value: unknown) {
    if (value === null || value === undefined) {
        return;
    }

    if (!isObject(value)) {
        throw new Error('`buildSizeBudgets` должен быть объектом или `null`');
    }

    Object.entries(value).forEach(([type, limits]) => {
        if (!isAssetType(type) || !isObject(limits)) {
            throw new Error('`buildSizeBudgets` принимает только объекты `js` и `css`');
        }

        Object.entries(limits).forEach(([metric, limit]) => {
            if (!isMetric(metric) || !Number.isSafeInteger(limit) || Number(limit) < 0) {
                throw new Error(
                    `buildSizeBudgets.${type}.${metric} должен быть целым неотрицательным числом байт (raw или gzip)`,
                );
            }
        });
    });
}
