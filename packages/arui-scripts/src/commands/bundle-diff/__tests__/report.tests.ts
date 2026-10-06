import os from 'os';
import path from 'path';

import { execute } from '@rsdoctor/cli';
import fs from 'fs-extra';

import { createSnapshot } from '../__fixtures__/snapshot';
import { generateBundleDiff } from '../report';

jest.mock('rslog', () => ({
    createLogger: () => ({
        override: jest.fn(),
        debug: jest.fn(),
    }),
}));

jest.mock('@rsdoctor/cli', () => ({
    execute: jest.fn(
        async (_command: string, options: { output?: string; json?: string | boolean }) => {
            if (options.output) {
                await fs.writeFile(options.output, '<html>Rsdoctor</html>');
            }

            if (typeof options.json === 'string') {
                await fs.writeJson(options.json, {});
            }

            return null;
        },
    ),
}));

let directory: string;

beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'arui-rsdoctor-'));
});

afterEach(async () => {
    await fs.remove(directory);
    jest.clearAllMocks();
});

it('generates native HTML/JSON reports and summarizes assets without source maps, licenses or precompressed copies', async () => {
    const baseline = await createSnapshot(directory, 'baseline', [{ name: 'main', js: 1024 }]);
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 1536 }]);
    const output = path.join(directory, 'diff');

    await generateBundleDiff({
        baseline,
        current,
        output,
        reportUrl: 'https://binary/reports/build-1/',
        currentLabel: 'feature @ abc',
        baselineLabel: 'develop @ def',
    });

    const comment = await fs.readFile(path.join(output, 'comment.md'), 'utf8');

    expect(comment).toContain('| 📄 JavaScript | 1.5 KB | 1 KB | +512 B (+50.0%) |');
    expect(comment).toContain('https://binary/reports/build-1/client-0.html');
    expect(comment).toContain('develop @ def');
    expect(await fs.readJson(path.join(output, 'summary.json'))).toEqual({
        current: { total: 1736, js: 1536, css: 100, html: 20, other: 80 },
        baseline: { total: 1224, js: 1024, css: 100, html: 20, other: 80 },
    });

    expect(execute).toHaveBeenCalledTimes(2);
});

it('leaves baseline cells empty and removes stale reports when no baseline is available', async () => {
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);
    const output = path.join(directory, 'diff');

    await fs.ensureDir(output);
    await fs.writeFile(path.join(output, 'client-0.html'), 'stale report');
    await generateBundleDiff({ current, output });

    const comment = await fs.readFile(path.join(output, 'comment.md'), 'utf8');

    expect(comment).toContain('| 📄 JavaScript | 100 B |  |  |');
    expect(comment).toContain('Baseline для точного коммита');
    expect(comment).not.toContain('Bundle Diff Report:');
    expect(await fs.readJson(path.join(output, 'summary.json'))).toEqual({
        current: { total: 300, js: 100, css: 100, html: 20, other: 80 },
        baseline: null,
    });
    expect(await fs.pathExists(path.join(output, 'client-0.html'))).toBe(false);
    expect(execute).not.toHaveBeenCalled();
});

async function setRsdoctorVersion(snapshot: string, rsdoctorVersion: string) {
    const file = path.join(snapshot, 'index.json');

    await fs.writeJson(file, { ...(await fs.readJson(file)), rsdoctorVersion });
}

it('reports a baseline collected by another Rsdoctor version instead of failing', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const baseline = await createSnapshot(directory, 'baseline', [{ name: 'main', js: 100 }]);
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);
    const output = path.join(directory, 'diff');

    await setRsdoctorVersion(baseline, '0.0.0');
    await generateBundleDiff({ baseline, current, output });

    const comment = await fs.readFile(path.join(output, 'comment.md'), 'utf8');

    expect(comment).toContain('| 📄 JavaScript | 100 B |  |  |');
    expect(comment).toContain('собран другой версией Rsdoctor');
    expect(comment).not.toContain('Baseline для точного коммита');
    expect((await fs.readJson(path.join(output, 'summary.json'))).baseline).toBeNull();
    expect(execute).not.toHaveBeenCalled();
});

it('treats a baseline directory without a snapshot as a missing baseline', async () => {
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);
    const output = path.join(directory, 'diff');

    await generateBundleDiff({ baseline: path.join(directory, 'not-downloaded'), current, output });

    expect(await fs.readFile(path.join(output, 'comment.md'), 'utf8')).toContain(
        'Baseline для точного коммита',
    );
    expect(execute).not.toHaveBeenCalled();
});

it('rejects a current snapshot collected by another Rsdoctor version', async () => {
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 100 }]);

    await setRsdoctorVersion(current, '0.0.0');

    await expect(
        generateBundleDiff({ current, output: path.join(directory, 'diff') }),
    ).rejects.toThrow('Incompatible Rsdoctor snapshot');
});

it('matches configurations by name and includes added and removed bundles in size changes', async () => {
    const baseline = await createSnapshot(directory, 'baseline', [
        { name: 'removed', js: 100 },
        { name: 'main', js: 200 },
    ]);
    const current = await createSnapshot(directory, 'current', [
        { name: 'main', js: 200 },
        { name: 'new', js: 300 },
    ]);
    const output = path.join(directory, 'diff');

    await generateBundleDiff({ baseline, current, output });

    expect(execute).toHaveBeenCalledWith(
        'bundle-diff',
        expect.objectContaining({
            baseline: path.join(baseline, '1.json'),
            current: path.join(current, '0.json'),
            html: true,
        }),
    );

    const comment = await fs.readFile(path.join(output, 'comment.md'), 'utf8');

    expect(comment).toContain('Новая клиентская конфигурация: new');
    expect(comment).toContain('Удаленная клиентская конфигурация: removed');
    expect(comment).toContain('| 📄 JavaScript | 500 B | 300 B | +200 B (+66.7%) |');
    expect(execute).toHaveBeenCalledTimes(2);
    expect(await fs.pathExists(path.join(output, 'client-1.html'))).toBe(false);
});

it('generates separate reports for every matching configuration regardless of baseline order', async () => {
    const baseline = await createSnapshot(directory, 'baseline', [
        { name: 'reactless', js: 1024 },
        { name: 'classic', js: 2048 },
    ]);
    const current = await createSnapshot(directory, 'current', [
        { name: 'classic', js: 2560 },
        { name: 'reactless', js: 1536 },
    ]);
    const output = path.join(directory, 'diff');

    await generateBundleDiff({ baseline, current, output });

    expect(execute).toHaveBeenNthCalledWith(1, 'bundle-diff', {
        baseline: path.join(baseline, '1.json'),
        current: path.join(current, '0.json'),
        html: true,
        open: false,
        output: path.join(output, 'client-0.html'),
    });
    expect(execute).toHaveBeenNthCalledWith(3, 'bundle-diff', {
        baseline: path.join(baseline, '0.json'),
        current: path.join(current, '1.json'),
        html: true,
        open: false,
        output: path.join(output, 'client-1.html'),
    });
    expect(await fs.readdir(output)).toEqual([
        'client-0.html',
        'client-0.json',
        'client-1.html',
        'client-1.json',
        'comment.md',
        'summary.json',
    ]);

    const comment = await fs.readFile(path.join(output, 'comment.md'), 'utf8');

    expect(comment).toContain('[📦 Bundle Diff Report: classic](client-0.html)');
    expect(comment).toContain('[📦 Bundle Diff Report: reactless](client-1.html)');
    expect(comment).toContain('| 📄 JavaScript | 4 KB | 3 KB | +1 KB (+33.3%) |');
});

it('removes only generated artifacts and preserves snapshots and unrelated output files', async () => {
    const output = path.join(directory, 'diff');
    const current = await createSnapshot(output, 'current', [{ name: 'main', js: 100 }]);
    const staleFiles = [
        'client-0.html',
        'client-0.json',
        'client-12.html',
        'comment.md',
        'summary.json',
    ];
    const preservedFiles = ['notes.json', 'client-report.html', 'client-0.html.backup'];

    await Promise.all(
        [...staleFiles, ...preservedFiles].map((file) =>
            fs.writeFile(path.join(output, file), 'old'),
        ),
    );
    await generateBundleDiff({ current, output });

    expect(await fs.readdir(output)).toEqual([
        'client-0.html.backup',
        'client-report.html',
        'comment.md',
        'current',
        'notes.json',
        'summary.json',
    ]);
    expect(await fs.readJson(path.join(current, 'index.json'))).toEqual(
        expect.objectContaining({ bundles: [{ name: 'main', dataFile: '0.json' }] }),
    );

    const contents = await Promise.all(
        preservedFiles.map((file) => fs.readFile(path.join(output, file), 'utf8')),
    );

    expect(contents).toEqual(['old', 'old', 'old']);
});

it('rejects a missing HTML artifact instead of publishing a broken report link', async () => {
    const baseline = await createSnapshot(directory, 'baseline', [{ name: 'main', js: 100 }]);
    const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 200 }]);
    const output = path.join(directory, 'diff');

    jest.mocked(execute).mockResolvedValueOnce(undefined);

    await expect(generateBundleDiff({ baseline, current, output })).rejects.toThrow(
        'Rsdoctor did not generate client-0.html',
    );
    expect(execute).toHaveBeenCalledTimes(1);
    expect(await fs.readdir(output)).toEqual([]);
});

it.each(['HTML', 'JSON'])(
    'propagates %s generation failures without writing a success comment',
    async (format) => {
        const baseline = await createSnapshot(directory, 'baseline', [{ name: 'main', js: 100 }]);
        const current = await createSnapshot(directory, 'current', [{ name: 'main', js: 200 }]);
        const output = path.join(directory, 'diff');
        const failure = new Error(`${format} generation failed`);

        if (format === 'JSON') {
            jest.mocked(execute).mockImplementationOnce(async () => {
                await fs.writeFile(path.join(output, 'client-0.html'), '<html>Rsdoctor</html>');
            });
        }

        jest.mocked(execute).mockRejectedValueOnce(failure);

        await expect(generateBundleDiff({ baseline, current, output })).rejects.toThrow(failure);
        expect(await fs.pathExists(path.join(output, 'comment.md'))).toBe(false);
        expect(await fs.pathExists(path.join(output, 'summary.json'))).toBe(false);
    },
);
