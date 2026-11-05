import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { CONSTANTS_PATH, imageExists, readDefaultImage, ROOT } from './docker-image.mjs';

export const WORKFLOW_PATH = '.github/workflows/alpine-node.yml';
export const IMAGE_README_PATH = 'packages/alpine-node-nginx/README.md';
export const ARTIFACTS_README_PATH = 'packages/arui-scripts-artifacts/README.md';
export const CONFIG_TEST_PATH =
    'packages/arui-scripts-artifacts/src/config/__tests__/config.test.ts';
export const CHANGESET_PATH = '.changeset/automated-node-base-image.md';
const PATHS = [
    WORKFLOW_PATH,
    IMAGE_README_PATH,
    CONSTANTS_PATH,
    CONFIG_TEST_PATH,
    ARTIFACTS_README_PATH,
];
const VERSION = /^\d+\.\d+\.\d+$/;

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function compareVersions(a, b) {
    const left = a.split('.').map(Number);
    const right = b.split('.').map(Number);

    return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

export function parseMatrix(workflow) {
    // This repository deliberately keeps the version matrix as flat, inline YAML mappings.
    // Fail closed when its format changes instead of partially updating a new matrix layout.
    const block = workflow.match(/\bversions:\s*\[([^\]]+)\]/)?.[1];

    assert(block, 'Cannot find the inline Node.js version matrix.');

    const rows = [...block.matchAll(/\{([^{}]+)\}/g)].map(([source, fields]) => {
        const row = Object.fromEntries(
            [...fields.matchAll(/(\w+):\s*(?:'([^']+)'|"([^"]+)"|([\w.-]+))/g)].map(
                ([, key, single, double, bare]) => [key, single ?? double ?? bare],
            ),
        );

        assert(
            VERSION.test(row.node) && /^\d+\.\d+$/.test(row.alpine) && row.image === 'node',
            `Unsupported Node.js matrix row: ${source}`,
        );

        const suffix = row.dockerfile === 'Dockerfile-slim' ? '-slim' : '';

        assert(
            ['Dockerfile', 'Dockerfile-slim'].includes(row.dockerfile) &&
                row.tag === `${row.node}${suffix}`,
            `Inconsistent Dockerfile/tag in matrix row: ${source}`,
        );

        return row;
    });

    assert(
        rows.length && block.replace(/\{[^{}]+\}/g, '').replace(/[\s,]/g, '') === '',
        'Unsupported Node.js matrix format.',
    );

    const majors = new Map();

    for (const row of rows) {
        const major = row.node.split('.')[0];
        const existing = majors.get(major);

        if (!existing) {
            majors.set(major, { ...row, variants: new Set([row.dockerfile]) });
        } else {
            assert(
                existing.node === row.node &&
                    existing.alpine === row.alpine &&
                    !existing.variants.has(row.dockerfile),
                `Inconsistent matrix rows for Node.js ${major}.`,
            );

            existing.variants.add(row.dockerfile);
        }
    }

    for (const [major, row] of majors) {
        assert(row.variants.size === 2, `Missing full/slim matrix pair for Node.js ${major}.`);
    }

    return [...majors.values()];
}

function replaceVersion(source, from, to) {
    const pattern = new RegExp(`(?<![\\d.])${from.replaceAll('.', '\\.')}(?![\\d.])`, 'g');

    return source.replace(pattern, to);
}

export function buildPrBody(updates) {
    if (!updates.length) {
        return 'No Node.js version updates available.\n';
    }

    return [
        'updates stable Node.js releases within the major versions already in docker matrix',
        '',
        '| Current | New |',
        '| --- | --- |',
        ...updates.map(
            ({ from, to }) => `| ${from} | [${to}](https://nodejs.org/en/blog/release/v${to}) |`,
        ),
        '',
        'Alpine versions are unchanged. The upstream Node.js images were checked before updating.',
        'Full and slim images are built without publishing in this PR.',
        'The npm release waits for the default alfabankui/arui-scripts image after merge.',
        '',
    ].join('\n');
}

export async function updateFiles(
    root,
    releases,
    { dryRun = false, hasImage = imageExists, log = console.log } = {},
) {
    assert(
        Array.isArray(releases) && releases.length > 0,
        'Node.js release index must be a nonempty array.',
    );

    const sources = new Map(
        await Promise.all(
            PATHS.map(async (path) => [path, await readFile(new URL(path, root), 'utf8')]),
        ),
    );
    const matrix = parseMatrix(sources.get(WORKFLOW_PATH));
    const defaultImage = readDefaultImage(sources.get(CONSTANTS_PATH));
    const defaultVersion = defaultImage.match(
        /^alfabankui\/arui-scripts:(\d+\.\d+\.\d+)-slim$/,
    )?.[1];

    assert(
        matrix.some(({ node }) => node === defaultVersion),
        'Default base image is not in the Node.js matrix.',
    );

    for (const path of [CONFIG_TEST_PATH, ARTIFACTS_README_PATH]) {
        assert(
            sources.get(path).includes(defaultImage),
            `${path} is out of sync with the default base image.`,
        );
    }

    for (const { node } of matrix) {
        assert(
            sources.get(IMAGE_README_PATH).includes(`- ${node}, ${node}-slim`),
            `${IMAGE_README_PATH} is out of sync with Node.js ${node}.`,
        );
    }

    const updates = [];

    for (const row of matrix) {
        const candidates = releases
            .map((release) => release?.version)
            .filter((version) => typeof version === 'string' && /^v\d+\.\d+\.\d+$/.test(version))
            .map((version) => version.slice(1))
            .filter((version) => version.split('.')[0] === row.node.split('.')[0])
            .sort((a, b) => compareVersions(b, a));
        assert(
            candidates.length > 0,
            `No stable release found for supported Node.js ${row.node.split('.')[0]}.`,
        );

        // Recreate pending PR updates even while a newer release is waiting for its image.
        for (const candidate of candidates) {
            if (compareVersions(candidate, row.node) <= 0) {
                break;
            }

            const image = `node:${candidate}-alpine${row.alpine}`;

            if (!(await hasImage(image))) {
                log(`Waiting for upstream image ${image}; checking older releases.`);
                continue;
            }

            updates.push({ from: row.node, to: candidate });
            break;
        }
    }

    const planned = new Map();

    for (const [path, source] of sources) {
        let next = source;

        for (const { from, to } of updates) next = replaceVersion(next, from, to);
        if (next !== source) planned.set(path, next);
    }

    const defaultUpdate = updates.find(({ from }) => from === defaultVersion);

    if (defaultUpdate) {
        planned.set(
            CHANGESET_PATH,
            `---\n'@alfalab/arui-scripts-artifacts': patch\n---\n\nОбновление базового контейнера до Node.js ${defaultUpdate.to}.\n`,
        );
    }

    // All validation and registry checks complete before any repository files are changed.
    if (!dryRun) {
        for (const [path, source] of planned) {
            const target = new URL(path, root);

            await mkdir(new URL('./', target), { recursive: true });
            await writeFile(target, source);
        }
    }

    return { updates, files: [...planned.keys()] };
}

async function main(args) {
    assert(
        args.every((arg) => arg === '--dry-run' || arg.startsWith('--body-file=')),
        'Usage: node scripts/update-node-versions.mjs [--dry-run] [--body-file=PATH]',
    );
    const response = await fetch('https://nodejs.org/dist/index.json', {
        signal: AbortSignal.timeout(30_000),
    });

    assert(response.ok, `Node release index returned HTTP ${response.status}.`);

    const result = await updateFiles(ROOT, await response.json(), {
        dryRun: args.includes('--dry-run'),
    });

    const body = buildPrBody(result.updates);

    console.log(body);
    console.log(
        `${args.includes('--dry-run') ? 'Would update' : 'Updated'}: ${
            result.files.join(', ') || '(no files)'
        }`,
    );

    const bodyPath = args
        .find((arg) => arg.startsWith('--body-file='))
        ?.slice('--body-file='.length);

    if (bodyPath) {
        const target = resolve(bodyPath);

        assert(
            !target.startsWith(fileURLToPath(ROOT)),
            '--body-file must be outside the repository.',
        );
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, body);
    }

    if (process.env.GITHUB_STEP_SUMMARY)
        await writeFile(process.env.GITHUB_STEP_SUMMARY, body, { flag: 'a' });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await main(process.argv.slice(2));
}
