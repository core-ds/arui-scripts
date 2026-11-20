import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { updateFiles } from './node-versions/update-files.mjs';

export { parseMatrix } from './node-versions/docker-matrix.mjs';
export {
    ARTIFACTS_DOC_PATHS,
    ARTIFACTS_README_PATH,
    CHANGESET_PATH,
    CONFIG_TEST_PATH,
    CONSTANTS_PATH,
    IMAGE_README_PATH,
    WORKFLOW_PATH,
    compareVersions,
    updateFiles,
} from './node-versions/update-files.mjs';

const ROOT = new URL('../', import.meta.url);

export function buildPrBody(updates) {
    if (!updates.length) {
        return 'No Node.js version updates available.\n';
    }

    return [
        'Updates stable Node.js releases within the major versions in the Docker matrix.',
        '',
        '| Current | New |',
        '| --- | --- |',
        ...updates.map(
            ({ from, to }) => `| ${from} | [${to}](https://nodejs.org/en/blog/release/v${to}) |`,
        ),
        '',
    ].join('\n');
}

async function main(args) {
    if (!args.every((arg) => arg === '--dry-run' || arg.startsWith('--body-file='))) {
        throw new Error(
            'Usage: node scripts/update-node-versions.mjs [--dry-run] [--body-file=PATH]',
        );
    }

    const response = await fetch('https://nodejs.org/dist/index.json', {
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        throw new Error(`Node release index returned HTTP ${response.status}.`);
    }

    const dryRun = args.includes('--dry-run');
    const { updates, files } = await updateFiles(ROOT, await response.json(), { dryRun });
    const body = buildPrBody(updates);

    console.log(body);
    console.log(`${dryRun ? 'Would update' : 'Updated'}: ${files.join(', ') || '(no files)'}`);

    const bodyPath = args
        .find((arg) => arg.startsWith('--body-file='))
        ?.slice('--body-file='.length);

    if (bodyPath) {
        const target = resolve(bodyPath);

        if (target.startsWith(fileURLToPath(ROOT))) {
            throw new Error('--body-file must be outside the repository.');
        }

        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, body);
    }

    if (process.env.GITHUB_STEP_SUMMARY)
        await writeFile(process.env.GITHUB_STEP_SUMMARY, body, { flag: 'a' });

    if (!dryRun && files.length && process.env.GITHUB_OUTPUT) {
        await writeFile(process.env.GITHUB_OUTPUT, `files<<FILES\n${files.join('\n')}\nFILES\n`, {
            flag: 'a',
        });
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main(process.argv.slice(2));
}
