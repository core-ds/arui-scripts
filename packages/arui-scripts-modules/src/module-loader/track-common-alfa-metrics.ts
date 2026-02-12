const METRICS_SCHEMA = 'iglu:com.alfabank/custom_dimension/jsonschema/1-0-0';

function mapDimensions(
    dimensionMap?: Record<string, string>,
    dimensionData?: Record<string, string | number>,
) {
    if (dimensionData && dimensionMap) {
        const additionalDataKeys = Object.keys(dimensionData);

        return Object.keys(dimensionMap).reduce<Record<string, string | number | undefined>>(
            (result, key) => {
                const dimensionLevel = dimensionMap[key];

                if (dimensionLevel && additionalDataKeys.includes(key)) {
                    return { ...result, [dimensionLevel]: dimensionData[key] };
                }

                return result;
            },
            {},
        );
    }

    return {};
}

export type SnowPlowFn = (
    action: string,
    trackerId: string,
    trackerUrl?: string,
    options?: Record<string, string | number | boolean> | string,
    property?: string | null,
    value?: number | null,
    data?: Array<{
        schema: string;
        data: Record<string, string | number | undefined>;
    }>,
) => void;

type Metric = {
    category: string;
    action: string;
    label: string;
    property?: string | null;
    value?: number | null;
    dimensionsMapping?: Record<string, string>;
};

/**
 * Пишет метрику, используя функцию, которая записана в window.sp
 *
 * @param {Object} metric метрика вида:
 * { category: String; action: String; label: String; property: String; value: SQL Numeric; dimensionsMapping: Object; }
 * @param {Object} additionalData дополнительные данные в виде объекта
 */
export function trackCommonAlfaMetrics(
    metric: Metric,
    additionalData: Record<string, string | number> = {},
) {
    if (typeof window !== 'undefined' && typeof window.sp === 'function') {
        const dimensions = mapDimensions(metric.dimensionsMapping, additionalData);

        window.sp(
            'trackStructEvent:mainApp',
            metric.category,
            metric.action,
            metric.label,
            metric.property,
            metric.value,
            [
                {
                    schema: METRICS_SCHEMA,
                    data: dimensions,
                },
            ],
        );
    }
}
