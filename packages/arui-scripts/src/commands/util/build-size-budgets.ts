import { readFile } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { constants as zlibConstants, gzip } from 'zlib';

import { type ChunkGroup, type Stats } from '@rspack/core';
import chalk from 'chalk';
import filesize from 'filesize';

import {
    BUILD_SIZE_ASSET_TYPES,
    BUILD_SIZE_METRICS,
    type BuildSizeAssetType,
    type BuildSizeBudgets,
    type BuildSizeLimit,
    type BuildSizeMetric,
} from '../../configs/app-configs/types';

export class BuildSizeBudgetError extends Error {
    constructor(messages: string[]) {
        super(messages.join('\n'));

        this.name = 'BuildSizeBudgetError';
    }
}

const gzipAsync = promisify(gzip);

// CompressionPlugin по умолчанию жмёт gzip с Z_BEST_COMPRESSION (9).
// Фоллбек в памяти берёт тот же уровень, чтобы файл без готового .gz
// получил тот же размер, что и файл, для которого плагин уже записал .gz.
const GZIP_LEVEL = zlibConstants.Z_BEST_COMPRESSION;

const ASSET_PATTERN: Record<BuildSizeAssetType, RegExp> = {
    js: /\.(?:js|mjs|cjs)$/i,
    css: /\.css$/i,
};

type Sizes = Record<BuildSizeMetric, number>;

type Compilation = Stats['compilation'];

type AssetSizeCache = {
    compilation: Compilation;
    outputPath: string | undefined;
    measurements: Map<string, Promise<Sizes>>;
};

function warn(message: string) {
    console.warn(chalk.yellow(message));
}

function reportOverBudget(messages: string[]) {
    if (!messages.length) {
        return;
    }

    console.warn(chalk.bgRed.white.bold('\n BUILD SIZE BUDGET EXCEEDED '));

    for (const message of messages) {
        console.warn(chalk.red.bold(message));
    }
}

function isConfigured(limits?: BuildSizeLimit) {
    return Object.keys(limits ?? {}).length > 0;
}

// получаем файлы точки входа вместе с файлами начальных родительских чанков
function getInitialFiles(group: ChunkGroup, visited = new Set<ChunkGroup>()): Set<string> {
    if (visited.has(group)) {
        return new Set();
    }

    visited.add(group);

    const files = new Set(group.getFiles());

    for (const parent of group.getParents()) {
        if (parent.isInitial()) {
            getInitialFiles(parent, visited).forEach((file) => files.add(file));
        }
    }

    return files;
}

async function calcAssetSizes(
    compilation: Compilation,
    outputPath: string | undefined,
    file: string,
    withGzip: boolean,
): Promise<Sizes> {
    if (!outputPath) {
        throw new Error('output.path is missing');
    }

    const content = await readFile(path.resolve(outputPath, file));
    const emitted = withGzip ? compilation.getAsset(`${file}.gz`) : undefined;

    return {
        raw: content.length,
        gzip:
            emitted?.source.size() ??
            (withGzip ? (await gzipAsync(content, { level: GZIP_LEVEL })).length : 0),
    };
}

async function calcInitialAssetSizes(
    cache: AssetSizeCache,
    files: Set<string>,
    type: BuildSizeAssetType,
    withGzip: boolean,
): Promise<Sizes> {
    const sizes: Sizes = { raw: 0, gzip: 0 };
    const matchingFiles = [...files].filter((file) => ASSET_PATTERN[type].test(file));

    for (const file of matchingFiles) {
        let pending = cache.measurements.get(file);

        if (!pending) {
            pending = calcAssetSizes(cache.compilation, cache.outputPath, file, withGzip);
            cache.measurements.set(file, pending);
        }

        // держим в памяти не больше одного буфера или сжатия одновременно.
        // eslint-disable-next-line no-await-in-loop
        const size = await pending;

        sizes.raw += size.raw;
        sizes.gzip += size.gzip;
    }

    return sizes;
}

function formatSize(bytes: number) {
    return filesize(bytes, { exponent: bytes >= 1024 ** 2 ? 2 : -1 });
}

function overBudgetMessages(
    compilerName: string,
    entryName: string,
    type: BuildSizeAssetType,
    limits: BuildSizeLimit,
    sizes: Sizes,
) {
    const messages: string[] = [];

    for (const metric of BUILD_SIZE_METRICS) {
        const limit = limits[metric];
        const actual = sizes[metric];

        if (limit !== undefined && actual > limit) {
            messages.push(
                `[buildSizeBudgets] ${compilerName}/${entryName}: initial ${type.toUpperCase()} (${metric}) is ${formatSize(
                    actual,
                )}; limit ${formatSize(limit)}; exceeded by ${formatSize(actual - limit)}.`,
            );
        }
    }

    return messages;
}

function failedToMeasureMessage(
    compilerName: string,
    entryName: string,
    type: BuildSizeAssetType,
    error: unknown,
) {
    const message = error instanceof Error ? error.message : String(error);

    return `[buildSizeBudgets] Could not measure ${compilerName}/${entryName} ${type.toUpperCase()}: ${message}`;
}

export async function checkBuildSizeBudgets(
    stats: Stats,
    budgets: BuildSizeBudgets | null,
    buildName?: string,
) {
    if (!budgets) {
        return;
    }

    const configuredTypes = BUILD_SIZE_ASSET_TYPES.filter((type) => isConfigured(budgets[type]));

    if (!configuredTypes.length) {
        return;
    }

    const { compilation } = stats;
    const compilerName = buildName || compilation.name || 'main';
    const cache: AssetSizeCache = {
        compilation,
        outputPath: compilation.outputOptions.path,
        measurements: new Map(),
    };
    const overBudget: string[] = [];

    for (const [entryName, entrypoint] of compilation.entrypoints) {
        for (const type of configuredTypes) {
            const limits = budgets[type]!;

            try {
                // точки входа измеряем по очереди, чтобы не держать несколько gzip сразу.
                // eslint-disable-next-line no-await-in-loop
                const sizes = await calcInitialAssetSizes(
                    cache,
                    getInitialFiles(entrypoint),
                    type,
                    limits.gzip !== undefined,
                );

                overBudget.push(
                    ...overBudgetMessages(compilerName, entryName, type, limits, sizes),
                );
            } catch (error) {
                const message = failedToMeasureMessage(compilerName, entryName, type, error);

                warn(message);
                throw new BuildSizeBudgetError([message]);
            }
        }
    }

    reportOverBudget(overBudget);

    if (overBudget.length) {
        throw new BuildSizeBudgetError(overBudget);
    }
}
