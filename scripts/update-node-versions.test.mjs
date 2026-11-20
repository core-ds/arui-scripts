import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import {
    ARTIFACTS_DOC_PATHS,
    ARTIFACTS_README_PATH,
    CHANGESET_PATH,
    CONFIG_TEST_PATH,
    CONSTANTS_PATH,
    IMAGE_README_PATH,
    WORKFLOW_PATH,
    parseMatrix,
    updateFiles,
} from './update-node-versions.mjs';

const repo = new URL('../', import.meta.url);
const imagePaths = [WORKFLOW_PATH, IMAGE_README_PATH];
const defaultImagePaths = [
    CONSTANTS_PATH,
    CONFIG_TEST_PATH,
    ARTIFACTS_README_PATH,
    ...ARTIFACTS_DOC_PATHS,
];
const fixturePaths = [...imagePaths, ...defaultImagePaths];

async function fixture(t) {
    const directory = await mkdtemp(join(tmpdir(), 'node-versions-test-'));
    const root = pathToFileURL(`${directory}/`);

    t.after(() => rm(directory, { recursive: true, force: true }));
    await Promise.all(fixturePaths.map((path) => cp(new URL(path, repo), new URL(path, root))));

    const matrix = parseMatrix(await readFile(new URL(WORKFLOW_PATH, root), 'utf8'));
    const constants = await readFile(new URL(CONSTANTS_PATH, root), 'utf8');
    const defaultRow = matrix.find(({ node }) =>
        constants.includes(`'alfabankui/arui-scripts:${node}-slim'`),
    );
    const otherRow = matrix.find(({ node }) => node !== defaultRow.node);
    const index = (...extra) =>
        [...matrix.map(({ node }) => node), ...extra].map((version) => ({
            version: `v${version}`,
        }));

    return { root, defaultRow, otherRow, index };
}

function nextPatch(version) {
    return version.replace(/\d+$/, (patch) => Number(patch) + 1);
}

function contents(root) {
    return Promise.all(fixturePaths.map((path) => readFile(new URL(path, root), 'utf8')));
}

test('selects the newest stable release numerically within an existing major', async (t) => {
    const { root, otherRow, index } = await fixture(t);
    const [major, minor] = otherRow.node.split('.').map(Number);
    const nextMinorBoundary = 10 ** String(minor + 1).length;
    const earlier = `${major}.${nextMinorBoundary - 1}.10`;
    const newest = `${major}.${nextMinorBoundary}.0`;

    const result = await updateFiles(
        root,
        index(earlier, newest, `${major}.${nextMinorBoundary + 1}.0-rc.1`, '999999.0.0'),
    );

    assert.deepEqual(result, {
        updates: [{ from: otherRow.node, to: newest }],
        files: imagePaths,
    });
    const matrix = parseMatrix(await readFile(new URL(WORKFLOW_PATH, root), 'utf8'));
    const readme = await readFile(new URL(IMAGE_README_PATH, root), 'utf8');

    assert.ok(matrix.some(({ node, alpine }) => node === newest && alpine === otherRow.alpine));
    assert.ok(readme.includes(`- ${newest}, ${newest}-slim`));
    await assert.rejects(readFile(new URL(CHANGESET_PATH, root)), { code: 'ENOENT' });
});

test('updates the default image, its docs, config test and changeset together', async (t) => {
    const { root, defaultRow, index } = await fixture(t);
    const next = nextPatch(defaultRow.node);
    const result = await updateFiles(root, index(next));

    assert.deepEqual(result, {
        updates: [{ from: defaultRow.node, to: next }],
        files: [...fixturePaths, CHANGESET_PATH],
    });
    for (const path of defaultImagePaths) {
        const content = await readFile(new URL(path, root), 'utf8');

        assert.ok(content.includes(`alfabankui/arui-scripts:${next}-slim`), path);
    }
    assert.match(
        await readFile(new URL(CHANGESET_PATH, root), 'utf8'),
        /'@alfalab\/arui-scripts-artifacts': patch/,
    );
    assert.deepEqual(await updateFiles(root, index(next)), { updates: [], files: [] });
});

test('reports an empty file list when no newer stable release is available', async (t) => {
    const { root, otherRow, index } = await fixture(t);
    const before = await contents(root);
    const major = otherRow.node.split('.')[0];

    const result = await updateFiles(
        root,
        index(`${major}.0.0`, `${nextPatch(otherRow.node)}-rc.1`),
    );

    assert.deepEqual(result, { updates: [], files: [] });
    assert.deepEqual(await contents(root), before);
});

test('dry-run reports the same planned changes without writing files', async (t) => {
    const { root, defaultRow, index } = await fixture(t);
    const before = await contents(root);
    const releases = index(nextPatch(defaultRow.node));

    const preview = await updateFiles(root, releases, { dryRun: true });

    assert.deepEqual(await contents(root), before);
    await assert.rejects(readFile(new URL(CHANGESET_PATH, root)), { code: 'ENOENT' });
    assert.deepEqual(preview, await updateFiles(root, releases));
});
