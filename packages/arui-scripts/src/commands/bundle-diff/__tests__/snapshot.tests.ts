import os from 'os';
import path from 'path';

import fs from 'fs-extra';

import { createSnapshot } from '../__fixtures__/snapshot';
import { IncompatibleSnapshotError, readSnapshot } from '../snapshot';

let directory: string;

beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'arui-rsdoctor-snapshot-'));
});

afterEach(async () => {
    await fs.remove(directory);
});

it.each([
    {
        case: 'unsupported schema versions',
        patch: { schemaVersion: 2 },
        error: IncompatibleSnapshotError,
    },
    {
        case: 'incompatible Rsdoctor versions',
        patch: { rsdoctorVersion: '0.0.0' },
        error: IncompatibleSnapshotError,
    },
    { case: 'empty bundle lists', patch: { bundles: [] }, error: 'Invalid Rsdoctor snapshot' },
    { case: 'non-array bundle lists', patch: { bundles: {} }, error: 'Invalid Rsdoctor snapshot' },
    {
        case: 'duplicate configuration names',
        patch: {
            bundles: [
                { name: 'main', dataFile: '0.json' },
                { name: 'main', dataFile: '0.json' },
            ],
        },
        error: 'Invalid or duplicate bundle',
    },
    {
        case: 'empty configuration names',
        patch: { bundles: [{ name: '', dataFile: '0.json' }] },
        error: 'Invalid or duplicate bundle',
    },
    {
        case: 'non-string data file paths',
        patch: { bundles: [{ name: 'main', dataFile: 42 }] },
        error: 'Invalid or duplicate bundle',
    },
])('rejects $case', async ({ patch, error }) => {
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);
    const file = path.join(current, 'index.json');
    const manifest = await fs.readJson(file);

    await fs.writeJson(file, { ...manifest, ...patch });

    await expect(readSnapshot(current)).rejects.toThrow(error);
});

it.each(['../outside.json', path.resolve(os.tmpdir(), 'outside.json')])(
    'rejects bundle data outside the snapshot: %s',
    async (dataFile) => {
        const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);
        const file = path.join(current, 'index.json');
        const manifest = await fs.readJson(file);

        await fs.writeJson(file, { ...manifest, bundles: [{ name: 'main', dataFile }] });

        await expect(readSnapshot(current)).rejects.toThrow('inside its snapshot');
    },
);

it.each(['chunkGraph', 'moduleGraph', 'packageGraph'])('rejects missing %s data', async (graph) => {
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);
    const file = path.join(current, '0.json');
    const report: { data: Record<string, unknown> } = await fs.readJson(file);

    delete report.data[graph];
    await fs.writeJson(file, report);

    await expect(readSnapshot(current)).rejects.toThrow('Invalid Rsdoctor data');
});

it.each([
    { case: 'negative sizes', asset: { path: 'main.js', size: -1 } },
    { case: 'non-numeric sizes', asset: { path: 'main.js', size: '100' } },
    { case: 'null sizes', asset: { path: 'main.js', size: null } },
    { case: 'non-string asset paths', asset: { path: 42, size: 100 } },
])('rejects $case', async ({ asset }) => {
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);
    const file = path.join(current, '0.json');
    const report: { data: { chunkGraph: { assets: unknown[] } } } = await fs.readJson(file);

    report.data.chunkGraph.assets[0] = { ...asset, chunks: [] };
    await fs.writeJson(file, report);

    await expect(readSnapshot(current)).rejects.toThrow('Invalid asset size');
});

it('propagates missing bundle data errors', async () => {
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);

    await fs.remove(path.join(current, '0.json'));

    await expect(readSnapshot(current)).rejects.toMatchObject({ code: 'ENOENT' });
});
