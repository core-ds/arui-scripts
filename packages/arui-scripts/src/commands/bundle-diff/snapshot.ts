import path from 'path';

import { type SDK } from '@rsdoctor/types';
import fs from 'fs-extra';

import { type RsdoctorSnapshot, rsdoctorVersion } from '../util/rsdoctor-snapshot';

export type Bundle = {
    name: string;
    file: string;
    data: SDK.BuilderStoreData;
};

export class IncompatibleSnapshotError extends Error {}

export async function readSnapshot(directory: string): Promise<Bundle[]> {
    const root = path.resolve(directory);
    const snapshot: RsdoctorSnapshot = await fs.readJson(path.join(root, 'index.json'));

    if (snapshot.schemaVersion !== 1 || snapshot.rsdoctorVersion !== rsdoctorVersion) {
        throw new IncompatibleSnapshotError(
            `Incompatible Rsdoctor snapshot ${root}: schema ${snapshot.schemaVersion}, Rsdoctor ${snapshot.rsdoctorVersion}; expected schema 1, Rsdoctor ${rsdoctorVersion}`,
        );
    }

    if (!Array.isArray(snapshot.bundles) || !snapshot.bundles.length) {
        throw new Error(`Invalid Rsdoctor snapshot: ${root}`);
    }

    const names = new Set<string>();

    return Promise.all(
        snapshot.bundles.map(async ({ name, dataFile }) => {
            if (
                typeof name !== 'string' ||
                !name ||
                names.has(name) ||
                typeof dataFile !== 'string'
            ) {
                throw new Error(`Invalid or duplicate bundle in ${root}`);
            }

            names.add(name);

            const file = path.resolve(root, dataFile);
            const relative = path.relative(root, file);

            if (
                relative.startsWith(`..${path.sep}`) ||
                relative === '..' ||
                path.isAbsolute(relative)
            ) {
                throw new Error(`Bundle data must be inside its snapshot: ${dataFile}`);
            }

            const { data } = await fs.readJson(file);

            if (
                !Array.isArray(data?.chunkGraph?.assets) ||
                !Array.isArray(data?.chunkGraph?.chunks) ||
                !Array.isArray(data?.moduleGraph?.modules) ||
                !Array.isArray(data?.packageGraph?.packages)
            ) {
                throw new Error(`Invalid Rsdoctor data: ${file}`);
            }

            if (
                data.chunkGraph.assets.some(
                    (asset: SDK.AssetData) =>
                        typeof asset.path !== 'string' ||
                        !Number.isFinite(asset.size) ||
                        asset.size < 0,
                )
            ) {
                throw new Error(`Invalid asset size in ${file}`);
            }

            return { name, file, data };
        }),
    );
}
