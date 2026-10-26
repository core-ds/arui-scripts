import path from 'path';

import fs from 'fs-extra';

import { rsdoctorVersion } from '../../util/rsdoctor-snapshot';

export async function createSnapshot(
    directory: string,
    name: string,
    bundles: Array<{ name: string; js: number }>,
): Promise<string> {
    const root = path.join(directory, name);

    await fs.ensureDir(root);
    await fs.writeJson(path.join(root, 'index.json'), {
        schemaVersion: 1,
        rsdoctorVersion,
        bundles: bundles.map((bundle, index) => ({ name: bundle.name, dataFile: `${index}.json` })),
    });
    await Promise.all(
        bundles.map((bundle, index) =>
            fs.writeJson(path.join(root, `${index}.json`), {
                data: {
                    chunkGraph: {
                        assets: [
                            { path: 'main.js', size: bundle.js, chunks: [] },
                            { path: 'main.css', size: 100, chunks: [] },
                            { path: 'index.html', size: 20, chunks: [] },
                            { path: 'image.png', size: 80, chunks: [] },
                            { path: 'main.js.map', size: 9999, chunks: [] },
                            { path: 'main.js.LICENSE.txt', size: 9999, chunks: [] },
                            { path: 'main.js.gz', size: 9999, chunks: [] },
                            { path: 'main.js.br', size: 9999, chunks: [] },
                        ],
                        chunks: [],
                        entrypoints: [],
                    },
                    moduleGraph: { modules: [] },
                    packageGraph: { packages: [] },
                },
            }),
        ),
    );

    return root;
}
