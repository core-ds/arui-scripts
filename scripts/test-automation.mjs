import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function runAutomationTests(directory = new URL('./', import.meta.url)) {
    const files = readdirSync(directory)
        .filter((name) => name.endsWith('.test.mjs'))
        .sort()
        .map((name) => fileURLToPath(new URL(name, directory)));

    if (files.length === 0) {
        throw new Error('No automation test files found.');
    }

    const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...files], {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
    });

    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        return result.status || 1;
    }

    const summaries = [...result.stdout.matchAll(/^# tests (\d+)\r?$/gm)];

    if (summaries.length === 0 || Number(summaries.at(-1)[1]) === 0) {
        throw new Error('No automation tests were executed.');
    }

    return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    process.exitCode = runAutomationTests();
}
