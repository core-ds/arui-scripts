import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { parseMatrix } from './docker-matrix.mjs';

export const CONSTANTS_PATH = 'packages/arui-scripts-artifacts/src/docker/constants.ts';
export const WORKFLOW_PATH = '.github/workflows/alpine-node.yml';
export const IMAGE_README_PATH = 'packages/alpine-node-nginx/README.md';
export const ARTIFACTS_README_PATH = 'packages/arui-scripts-artifacts/README.md';
export const ARTIFACTS_DOC_PATHS = [
    'packages/arui-scripts-artifacts/docs/migration.md',
    'packages/arui-scripts-artifacts/docs/settings.md',
];
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

function replaceVersion(source, from, to) {
    const pattern = new RegExp(`(?<![\\d.])${from.replaceAll('.', '\\.')}(?![\\d.])`, 'g');

    return source.replace(pattern, to);
}

function readCurrentVersions(sources) {
    const matrix = parseMatrix(sources.get(WORKFLOW_PATH));
    const defaultImage = sources
        .get(CONSTANTS_PATH)
        .match(/export const DEFAULT_BASE_DOCKER_IMAGE = '([^']+)';/)?.[1];

    assert(defaultImage, `Cannot read DEFAULT_BASE_DOCKER_IMAGE in ${CONSTANTS_PATH}.`);

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

    return { matrix, defaultVersion };
}

function selectUpdates(matrix, releases) {
    const updates = [];

    for (const { node } of matrix) {
        const major = node.split('.')[0];
        const [latest] = releases
            .map((release) => release?.version)
            .filter((version) => typeof version === 'string' && /^v\d+\.\d+\.\d+$/.test(version))
            .map((version) => version.slice(1))
            .filter((version) => version.startsWith(`${major}.`))
            .sort((a, b) => compareVersions(b, a));

        assert(latest, `No stable release found for supported Node.js ${major}.`);

        if (compareVersions(latest, node) > 0) {
            updates.push({ from: node, to: latest });
        }
    }

    return updates;
}

export async function updateFiles(root, releases, { dryRun = false } = {}) {
    assert(
        Array.isArray(releases) && releases.length > 0,
        'Node.js release index must be a nonempty array.',
    );

    const sources = new Map(
        await Promise.all(
            PATHS.map(async (path) => [path, await readFile(new URL(path, root), 'utf8')]),
        ),
    );
    const { matrix, defaultVersion } = readCurrentVersions(sources);
    const updates = selectUpdates(matrix, releases);

    const planned = new Map();

    for (const [path, source] of sources) {
        let next = source;

        for (const { from, to } of updates) next = replaceVersion(next, from, to);
        if (next !== source) planned.set(path, next);
    }

    const defaultUpdate = updates.find(({ from }) => from === defaultVersion);

    if (defaultUpdate) {
        const nextImage = `alfabankui/arui-scripts:${defaultUpdate.to}-slim`;
        const docs = await Promise.all(
            ARTIFACTS_DOC_PATHS.map(async (path) => [
                path,
                await readFile(new URL(path, root), 'utf8'),
            ]),
        );

        // These examples can lag behind the configured default after a manual update.
        for (const [path, source] of docs) {
            const next = source.replace(
                /(?<=['"`])alfabankui\/arui-scripts:\d+\.\d+\.\d+-slim(?=['"`])/g,
                nextImage,
            );

            if (next !== source) {
                planned.set(path, next);
            }
        }

        planned.set(
            CHANGESET_PATH,
            `---\n'@alfalab/arui-scripts-artifacts': patch\n---\n\nОбновление базового контейнера до Node.js ${defaultUpdate.to}.\n`,
        );
    }

    // Complete validation and plan all edits before writing any files.
    if (!dryRun) {
        for (const [path, source] of planned) {
            const target = new URL(path, root);

            await mkdir(new URL('./', target), { recursive: true });
            await writeFile(target, source);
        }
    }

    return { updates, files: [...planned.keys()] };
}
