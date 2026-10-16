import os from 'os';
import path from 'path';

import { type Configuration, rspack } from '@rspack/core';
import fs from 'fs-extra';

import {
    enableRsdoctor,
    normalizeWorkspacePaths,
    type RsdoctorSnapshot,
    rsdoctorVersion,
    writeRsdoctorSnapshot,
} from '../rsdoctor-snapshot';

let directory: string;

beforeEach(async () => {
    // rspack резолвит симлинки (/var -> /private/var на macOS), поэтому работаем с реальным путём
    directory = await fs.realpath(
        await fs.mkdtemp(path.join(os.tmpdir(), 'arui-rsdoctor-export-')),
    );
});

afterEach(async () => {
    await fs.remove(directory);
    jest.restoreAllMocks();
});

it('leaves regular builds unchanged without opt-in', async () => {
    const config = { plugins: [] };

    expect(await enableRsdoctor(config, undefined, '/app/src')).toBeUndefined();
    expect(config.plugins).toEqual([]);
});

async function writeFixture(): Promise<string> {
    const src = path.join(directory, 'src');

    await fs.outputFile(
        path.join(src, 'index.js'),
        "import { greet } from './greet';\n\ndocument.title = greet(document.title);\n",
    );
    await fs.outputFile(
        path.join(src, 'greet.js'),
        "export function greet(name) {\n    return 'Hello, ' + name;\n}\n",
    );

    return src;
}

function createFixtureConfig(src: string): Configuration {
    return {
        mode: 'production',
        context: directory,
        entry: './src/index.js',
        devtool: 'source-map',
        output: {
            path: path.join(directory, 'dist'),
            // как в rspack.client.ts: пути в source maps относительно исходников
            devtoolModuleFilenameTemplate: (info: { absoluteResourcePath: string }) =>
                path.relative(src, info.absoluteResourcePath),
        },
    };
}

function compile(config: Configuration): Promise<void> {
    const compiler = rspack(config);

    return new Promise((resolve, reject) => {
        compiler.run((error, stats) => {
            compiler.close(() => {
                if (error || stats?.hasErrors()) {
                    reject(error ?? new Error(stats?.toString()));
                } else {
                    resolve();
                }
            });
        });
    });
}

async function readOutput(): Promise<Record<string, string>> {
    const outputPath = path.join(directory, 'dist');
    const files = await fs.readdir(outputPath);

    return Object.fromEntries(
        await Promise.all(
            files.map(async (file) => [
                file,
                await fs.readFile(path.join(outputPath, file), 'utf8'),
            ]),
        ),
    );
}

it('keeps emitted bundles and source maps identical to a regular build', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const src = await writeFixture();

    await compile(createFixtureConfig(src));

    const regularOutput = await readOutput();
    const config = createFixtureConfig(src);

    await fs.remove(path.join(directory, 'dist'));
    await enableRsdoctor(config, path.join(directory, 'rsdoctor'), src);
    await compile(config);

    expect(Object.keys(regularOutput).sort()).toEqual(['main.js', 'main.js.map']);
    expect(await readOutput()).toEqual(regularOutput);
}, 30000);

it('lets Rsdoctor attribute bundled code to source modules', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const src = await writeFixture();
    const config = createFixtureConfig(src);

    await enableRsdoctor(config, path.join(directory, 'rsdoctor'), src);
    await compile(config);

    const { data } = await fs.readJson(
        path.join(directory, 'rsdoctor', 'client-0', 'rsdoctor-data.json'),
    );
    const greet = data.moduleGraph.modules.find(
        (module: { path: string }) => module.path === path.join(src, 'greet.js'),
    );

    expect(greet.size.parsedSize).toBeGreaterThan(0);
}, 30000);

it('normalizes different Jenkins workspaces identically and preserves external paths', () => {
    const report = (root: string) => ({
        data: {
            root,
            moduleGraph: { modules: [{ path: `${root}/src/app.ts` }] },
            packageGraph: { packages: [{ root: `${root}/node_modules/react` }] },
            external: { path: '/opt/shared/lib.js' },
        },
        text: 'do not rewrite content',
    });

    expect(normalizeWorkspacePaths(report('/agent/build-1'), '/agent/build-1')).toEqual(
        normalizeWorkspacePaths(report('/agent/build-2'), '/agent/build-2'),
    );
    expect(normalizeWorkspacePaths({ path: '/agent/build-123/app.js' }, '/agent/build-1')).toEqual({
        path: '/agent/build-123/app.js',
    });
});

it('rejects ambiguous client configuration names', async () => {
    await expect(
        enableRsdoctor([{ name: 'same' }, { name: 'same' }], '/unused', '/app/src'),
    ).rejects.toThrow('unique client configuration names');
});

it('normalizes Windows workspace paths and path fields nested in arrays', () => {
    const root = 'C:\\jenkins\\workspace\\build-1';
    const input = {
        root,
        values: [
            { file: `${root}\\src\\app.ts`, filename: `${root}\\src\\index.ts` },
            { resource: `${root}\\styles\\main.css`, resolved: `${root}\\node_modules\\react` },
        ],
        external: { path: 'D:\\shared\\lib.js' },
    };

    expect(normalizeWorkspacePaths(input, root)).toEqual({
        root: '.',
        values: [
            { file: './src/app.ts', filename: './src/index.ts' },
            { resource: './styles/main.css', resolved: './node_modules/react' },
        ],
        external: { path: 'D:\\shared\\lib.js' },
    });
    expect(input.root).toBe(root);
});

it('preserves source content, non-path fields and primitive values', () => {
    const root = '/agent/build-1';
    const input = {
        source: `${root}/src/app.ts`,
        name: `${root}/src/app.ts`,
        nested: [null, true, 42, `${root}/src/app.ts`, { path: root }],
    };

    expect(normalizeWorkspacePaths(input, root)).toEqual({
        source: `${root}/src/app.ts`,
        name: `${root}/src/app.ts`,
        nested: [null, true, 42, `${root}/src/app.ts`, { path: '.' }],
    });
    expect(input.nested[4]).toEqual({ path: root });
});

function createManifest(): RsdoctorSnapshot {
    return {
        schemaVersion: 1,
        rsdoctorVersion,
        bundles: [
            { name: 'classic', dataFile: 'client-0/rsdoctor-data.json' },
            { name: 'reactless', dataFile: 'client-1/rsdoctor-data.json' },
        ],
    };
}

async function writeReport(dataFile: string, root: string): Promise<void> {
    await fs.outputJson(path.join(directory, dataFile), {
        data: {
            root,
            chunkGraph: { assets: [] },
            moduleGraph: { modules: [{ path: `${root}/src/app.ts` }] },
            packageGraph: { packages: [{ root: `${root}/node_modules/react` }] },
        },
        source: `${root}/src/app.ts`,
    });
}

it('normalizes all client reports before writing the snapshot completion marker', async () => {
    const snapshot = createManifest();

    await Promise.all(
        snapshot.bundles.map(({ dataFile }, index) =>
            writeReport(dataFile, `/agent/build-${index}`),
        ),
    );
    await writeRsdoctorSnapshot({ directory, snapshot });

    expect(await fs.readJson(path.join(directory, 'index.json'))).toEqual(snapshot);

    const reports = await Promise.all(
        snapshot.bundles.map(({ dataFile }) => fs.readJson(path.join(directory, dataFile))),
    );

    reports.forEach((report, index) => {
        expect(report.data).toEqual({
            root: '.',
            chunkGraph: { assets: [] },
            moduleGraph: { modules: [{ path: './src/app.ts' }] },
            packageGraph: { packages: [{ root: './node_modules/react' }] },
        });
        expect(report.source).toBe(`/agent/build-${index}/src/app.ts`);
    });
});

it.each([
    { case: 'missing workspace roots', data: { chunkGraph: { assets: [] } } },
    { case: 'non-string workspace roots', data: { root: 42, chunkGraph: { assets: [] } } },
    { case: 'missing asset lists', data: { root: '/agent/build-1', chunkGraph: {} } },
])('does not publish a completion marker for $case in any client report', async ({ data }) => {
    const snapshot = createManifest();

    await writeReport(snapshot.bundles[0].dataFile, '/agent/build-0');
    await fs.outputJson(path.join(directory, snapshot.bundles[1].dataFile), { data });

    await expect(writeRsdoctorSnapshot({ directory, snapshot })).rejects.toThrow(
        'Invalid Rsdoctor data',
    );
    expect(await fs.pathExists(path.join(directory, 'index.json'))).toBe(false);
});

it('does not publish a completion marker when a client report is missing', async () => {
    const snapshot = createManifest();

    await writeReport(snapshot.bundles[0].dataFile, '/agent/build-0');

    await expect(writeRsdoctorSnapshot({ directory, snapshot })).rejects.toMatchObject({
        code: 'ENOENT',
    });
    expect(await fs.pathExists(path.join(directory, 'index.json'))).toBe(false);
});
