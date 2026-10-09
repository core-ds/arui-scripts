import path from 'path';

import {
    type Asset,
    type Compiler,
    type Configuration,
    type RspackPluginInstance,
} from '@rspack/core';
import fs from 'fs-extra';

export const rsdoctorVersion = '1.6.4';

// Rsdoctor reads source maps at this processAssets stage to attribute bundled code to modules.
const RSDOCTOR_SOURCE_MAPS_STAGE = 2400;
const PLUGIN_NAME = 'AruiRsdoctorSourceMaps';

export type RsdoctorSnapshot = {
    schemaVersion: 1;
    rsdoctorVersion: string;
    bundles: Array<{ name: string; dataFile: string }>;
};

type SnapshotOutput = {
    directory: string;
    snapshot: RsdoctorSnapshot;
};

/**
 * Не дает Rsdoctor менять production source maps.
 * Увидев devtool, Rsdoctor переписывает devtoolModuleFilenameTemplate на абсолютные пути,
 * поэтому он подключается со скрытым devtool. Чтобы он все равно сопоставил код с модулями,
 * картам на время его чтения выставляется абсолютный sourceRoot, затем они восстанавливаются.
 */
function keepSourceMaps(rsdoctor: RspackPluginInstance, sourceRoot: string): RspackPluginInstance {
    return {
        apply(compiler: Compiler) {
            /* eslint-disable no-param-reassign */
            const { devtool } = compiler.options;

            compiler.options.devtool = false;
            rsdoctor.apply(compiler);
            compiler.options.devtool = devtool;
            /* eslint-enable no-param-reassign */

            const { RawSource } = compiler.webpack.sources;

            compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
                const originals = new Map<string, Asset['source']>();

                compilation.hooks.processAssets.tap(
                    { name: PLUGIN_NAME, stage: RSDOCTOR_SOURCE_MAPS_STAGE - 1 },
                    () => {
                        compilation.getAssets().forEach(({ name, source }) => {
                            if (!name.endsWith('.map')) {
                                return;
                            }

                            const map = JSON.parse(source.source().toString());

                            originals.set(name, source);
                            compilation.updateAsset(
                                name,
                                new RawSource(JSON.stringify({ ...map, sourceRoot })),
                            );
                        });
                    },
                );
                compilation.hooks.processAssets.tap(
                    { name: PLUGIN_NAME, stage: RSDOCTOR_SOURCE_MAPS_STAGE + 1 },
                    () => {
                        originals.forEach((source, name) => compilation.updateAsset(name, source));
                        originals.clear();
                    },
                );
            });
        },
    };
}

export async function enableRsdoctor(
    configuration: Configuration | Configuration[],
    outputDirectory: string | undefined,
    sourceRoot: string,
): Promise<SnapshotOutput | undefined> {
    if (!outputDirectory) {
        return undefined;
    }

    const directory = path.resolve(outputDirectory);
    const configurations = Array.isArray(configuration) ? configuration : [configuration];
    const names = configurations.map(
        (config, index) => config.name || (index === 0 ? 'main' : `client-${index}`),
    );

    if (new Set(names).size !== names.length) {
        throw new Error('Rsdoctor requires unique client configuration names');
    }

    // Remove the completion marker before compiling so a failed build cannot reuse an old snapshot.
    await fs.remove(path.join(directory, 'index.json'));
    await Promise.all(
        configurations.map((_, index) =>
            fs.remove(path.join(directory, `client-${index}/rsdoctor-data.json`)),
        ),
    );
    const { RsdoctorRspackPlugin } = await import('@rsdoctor/rspack-plugin');

    const bundles = configurations.map((config, index) => {
        const reportDir = path.join(directory, `client-${index}`);

        // eslint-disable-next-line no-param-reassign
        config.plugins = [
            ...(config.plugins || []),
            keepSourceMaps(
                new RsdoctorRspackPlugin({
                    disableClientServer: true,
                    // Loader probes change module identifiers and therefore production module ids.
                    features: ['bundle'],
                    // Collect report data without adding new compilation warnings or quality gates.
                    linter: { level: 'Ignore' },
                    output: {
                        mode: 'brief',
                        reportDir,
                        reportCodeType: 'noCode',
                        options: { type: ['json'] },
                    },
                }),
                sourceRoot,
            ),
        ];

        return { name: names[index], dataFile: `client-${index}/rsdoctor-data.json` };
    });

    return { directory, snapshot: { schemaVersion: 1, rsdoctorVersion, bundles } };
}

// Jenkins builds use different absolute workspace paths. Rsdoctor matches modules by path.
export function normalizeWorkspacePaths(value: unknown, root: string): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeWorkspacePaths(item, root));
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => {
            if (
                ['path', 'root', 'file', 'filename', 'resource', 'resolved'].includes(key) &&
                typeof item === 'string'
            ) {
                if (item === root) {
                    return [key, '.'];
                }

                if (item.startsWith(`${root}/`) || item.startsWith(`${root}\\`)) {
                    return [key, `./${item.slice(root.length + 1).replace(/\\/g, '/')}`];
                }
            }

            return [key, normalizeWorkspacePaths(item, root)];
        }),
    );
}

export async function writeRsdoctorSnapshot({
    directory,
    snapshot,
}: SnapshotOutput): Promise<void> {
    for (const bundle of snapshot.bundles) {
        const file = path.join(directory, bundle.dataFile);
        // eslint-disable-next-line no-await-in-loop
        const report = await fs.readJson(file);

        if (
            typeof report.data?.root !== 'string' ||
            !Array.isArray(report.data?.chunkGraph?.assets)
        ) {
            throw new Error(`Invalid Rsdoctor data: ${file}`);
        }

        // eslint-disable-next-line no-await-in-loop
        await fs.writeJson(file, normalizeWorkspacePaths(report, report.data.root));
    }

    await fs.writeJson(path.join(directory, 'index.json'), snapshot, { spaces: 2 });
}
