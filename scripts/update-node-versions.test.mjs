import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { CONSTANTS_PATH, readDefaultImage, ROOT } from './docker-image.mjs';
import {
    ARTIFACTS_README_PATH,
    buildPrBody,
    CHANGESET_PATH,
    CONFIG_TEST_PATH,
    IMAGE_README_PATH,
    parseMatrix,
    updateFiles,
    WORKFLOW_PATH,
} from './update-node-versions.mjs';

const paths = [
    WORKFLOW_PATH,
    IMAGE_README_PATH,
    CONSTANTS_PATH,
    CONFIG_TEST_PATH,
    ARTIFACTS_README_PATH,
];
const current = parseMatrix(await readFile(new URL(WORKFLOW_PATH, ROOT), 'utf8'));
const defaultImage = readDefaultImage(await readFile(new URL(CONSTANTS_PATH, ROOT), 'utf8'));
const defaultRow = current.find(({ node }) => defaultImage.endsWith(`:${node}-slim`));
const otherRow = current.find(({ node }) => node !== defaultRow.node);
const nextPatch = (version) => version.replace(/\d+$/, (patch) => Number(patch) + 1);
const index = (extra = []) => [
    ...current.map(({ node }) => ({ version: `v${node}` })),
    ...extra.map((version) => ({ version: `v${version}` })),
];
const options = { hasImage: async () => true, log: () => {} };

async function fixture(t) {
    const directory = await mkdtemp(join(tmpdir(), 'node-versions-test-'));
    const root = pathToFileURL(`${directory}/`);

    t.after(() => rm(directory, { recursive: true, force: true }));
    for (const path of paths)
        await cp(new URL(path, ROOT), new URL(path, root), { recursive: true });

    return root;
}

async function contents(root) {
    return Promise.all(paths.map((path) => readFile(new URL(path, root), 'utf8')));
}

test('selects the latest stable release numerically within existing major versions', async (t) => {
    const root = await fixture(t);
    const major = defaultRow.node.split('.')[0];
    const versions = [
        `${major}.100.2`,
        `${major}.99.10`,
        `${major}.100.1`,
        `${major}.101.0-rc.1`,
        `${major}.101.0-beta.1`,
        `${major}.101.0-alpha.1`,
        '99.0.0',
    ];
    const result = await updateFiles(root, index(versions), options);

    assert.deepEqual(result.updates, [{ from: defaultRow.node, to: `${major}.100.2` }]);
    assert.equal(
        parseMatrix(await readFile(new URL(WORKFLOW_PATH, root), 'utf8')).length,
        current.length,
    );
});

test('updates matrix pairs, README examples, default image, test and changeset together', async (t) => {
    const root = await fixture(t);
    const updates = current.map(({ node }) => ({ from: node, to: nextPatch(node) }));
    const seen = [];
    const result = await updateFiles(root, index(updates.map(({ to }) => to)), {
        ...options,
        hasImage: async (image) => {
            seen.push(image);
            return true;
        },
    });

    assert.deepEqual(result.updates, updates);
    assert.deepEqual(new Set(result.files), new Set([...paths, CHANGESET_PATH]));
    assert.deepEqual(
        seen,
        current.map(({ node, alpine }) => `node:${nextPatch(node)}-alpine${alpine}`),
    );
    const workflow = await readFile(new URL(WORKFLOW_PATH, root), 'utf8');

    assert.deepEqual(
        parseMatrix(workflow).map(({ node, alpine }) => ({ node, alpine })),
        current.map(({ node, alpine }) => ({ node: nextPatch(node), alpine })),
    );
    for (const { from, to } of updates) {
        assert.ok(workflow.includes(`tag: '${to}'`));
        assert.ok(workflow.includes(`tag: '${to}-slim'`));
        assert.ok(!workflow.includes(`node: '${from}'`));
    }
    const readme = await readFile(new URL(IMAGE_README_PATH, root), 'utf8');

    assert.ok(readme.includes(`NODE_VERSION=${nextPatch(defaultRow.node)}`));
    for (const path of [CONSTANTS_PATH, CONFIG_TEST_PATH, ARTIFACTS_README_PATH]) {
        assert.ok(
            (await readFile(new URL(path, root), 'utf8')).includes(
                `alfabankui/arui-scripts:${nextPatch(defaultRow.node)}-slim`,
            ),
        );
    }
    assert.match(
        await readFile(new URL(CHANGESET_PATH, root), 'utf8'),
        /'@alfalab\/arui-scripts-artifacts': patch/,
    );
});

test('does not downgrade versions or write files when there are no new stable releases', async (t) => {
    const root = await fixture(t);
    const before = await contents(root);
    const result = await updateFiles(
        root,
        index(current.map(({ node }) => `${node.split('.')[0]}.0.0`)),
        {
            ...options,
            hasImage: () => assert.fail('No registry request needed without updates'),
        },
    );

    assert.deepEqual(result, { updates: [], files: [] });
    assert.deepEqual(await contents(root), before);
});

test('waits for the latest upstream image without preventing other major updates', async (t) => {
    const root = await fixture(t);
    const result = await updateFiles(root, index(current.map(({ node }) => nextPatch(node))), {
        ...options,
        hasImage: async (image) => !image.startsWith(`node:${nextPatch(defaultRow.node)}-`),
    });

    assert.equal(result.updates.length, current.length - 1);
    assert.ok(!result.updates.some(({ from }) => from === defaultRow.node));
    assert.ok(!result.files.includes(CHANGESET_PATH));
    assert.equal(
        readDefaultImage(await readFile(new URL(CONSTANTS_PATH, root), 'utf8')),
        defaultImage,
    );
});

test('does not create an artifacts changeset when only a nondefault major changes', async (t) => {
    const root = await fixture(t);
    const result = await updateFiles(root, index([nextPatch(otherRow.node)]), options);

    assert.deepEqual(new Set(result.files), new Set([WORKFLOW_PATH, IMAGE_README_PATH]));
    await assert.rejects(readFile(new URL(CHANGESET_PATH, root)), { code: 'ENOENT' });
});

test('preserves an available pending update when the next release has no Docker image', async (t) => {
    const pending = nextPatch(defaultRow.node);
    const latest = nextPatch(pending);
    const firstRoot = await fixture(t);
    const pendingResult = await updateFiles(firstRoot, index([pending]), options);
    const nextRoot = await fixture(t);
    const inspected = [];
    const nextResult = await updateFiles(nextRoot, index([pending, latest]), {
        ...options,
        hasImage: async (image) => {
            inspected.push(image);
            return image === `node:${pending}-alpine${defaultRow.alpine}`;
        },
    });

    assert.deepEqual(nextResult, pendingResult);
    assert.deepEqual(await contents(nextRoot), await contents(firstRoot));
    assert.deepEqual(inspected, [
        `node:${latest}-alpine${defaultRow.alpine}`,
        `node:${pending}-alpine${defaultRow.alpine}`,
    ]);
});

test('falls back independently per major and never checks versions older than the matrix', async (t) => {
    const root = await fixture(t);
    const pending = nextPatch(defaultRow.node);
    const latest = nextPatch(pending);
    const other = nextPatch(otherRow.node);
    const inspected = [];
    const result = await updateFiles(root, index([pending, latest, other]), {
        ...options,
        hasImage: async (image) => {
            inspected.push(image);
            return !image.startsWith(`node:${latest}-`);
        },
    });

    assert.deepEqual(new Set(result.updates.map(({ to }) => to)), new Set([pending, other]));
    for (const { node } of current) {
        assert.ok(!inspected.some((image) => image.startsWith(`node:${node}-`)));
    }
});

test('dry-run reports the same updates without changing any files', async (t) => {
    const root = await fixture(t);
    const before = await contents(root);
    const releases = index([nextPatch(defaultRow.node)]);
    const dry = await updateFiles(root, releases, { ...options, dryRun: true });

    assert.ok(dry.files.includes(CHANGESET_PATH));
    assert.deepEqual(await contents(root), before);
    await assert.rejects(readFile(new URL(CHANGESET_PATH, root)), { code: 'ENOENT' });
    assert.deepEqual(await updateFiles(root, releases, options), dry);
});

test('a second run is a no-op and keeps the generated changeset intact', async (t) => {
    const root = await fixture(t);
    const releases = index([nextPatch(defaultRow.node)]);

    await updateFiles(root, releases, options);
    const before = await contents(root);
    const changeset = await readFile(new URL(CHANGESET_PATH, root), 'utf8');

    assert.deepEqual(await updateFiles(root, releases, options), { updates: [], files: [] });
    assert.deepEqual(await contents(root), before);
    assert.equal(await readFile(new URL(CHANGESET_PATH, root), 'utf8'), changeset);
});

test('rejects inconsistent documentation before making any writes', async (t) => {
    const root = await fixture(t);
    const target = new URL(ARTIFACTS_README_PATH, root);

    await writeFile(target, (await readFile(target, 'utf8')).replace(defaultImage, 'custom:image'));
    const before = await contents(root);

    await assert.rejects(
        updateFiles(root, index([nextPatch(defaultRow.node)]), options),
        /out of sync/,
    );
    assert.deepEqual(await contents(root), before);
});

test('rejects inconsistent matrix pairs, missing variants and unsupported layouts', () => {
    const row = current[0];
    const full = `{ node: '${row.node}', alpine: '${row.alpine}', image: node, dockerfile: Dockerfile, tag: '${row.node}' }`;
    const slim = `{ node: '${row.node}', alpine: '${row.alpine}', image: node, dockerfile: Dockerfile-slim, tag: '${row.node}-slim' }`;

    assert.throws(() => parseMatrix(`versions: [${full}]`), /Missing full\/slim/);
    assert.throws(
        () => parseMatrix(`versions: [${full}, ${slim.replace(row.alpine, '0.0')}]`),
        /Inconsistent matrix/,
    );
    assert.throws(
        () => parseMatrix(`versions: [${full}, ${slim.replace("-slim'", "-wrong'")}]`),
        /Inconsistent Dockerfile/,
    );
    assert.throws(
        () => parseMatrix(`versions: [${full}, ${slim}, unexpected]`),
        /Unsupported.*format/,
    );
    assert.throws(() => parseMatrix('versions:\n  - node: 24.0.0'), /Cannot find/);
});

test('a registry failure aborts the complete update before any writes', async (t) => {
    const root = await fixture(t);
    const before = await contents(root);
    let calls = 0;

    await assert.rejects(
        updateFiles(root, index(current.map(({ node }) => nextPatch(node))), {
            ...options,
            hasImage: async () => {
                if (++calls === 2) throw new Error('Registry unavailable');
                return true;
            },
        }),
        /Registry unavailable/,
    );
    assert.deepEqual(await contents(root), before);
});

test('rejects invalid or incomplete release indexes without writing', async (t) => {
    const root = await fixture(t);
    const before = await contents(root);

    for (const releases of [null, {}, [], [{ version: 'v99.0.0' }]]) {
        await assert.rejects(
            updateFiles(root, releases, options),
            /release index|No stable release/,
        );
    }
    assert.deepEqual(await contents(root), before);
});

test('version replacement preserves longer versions with the same prefix', async (t) => {
    const root = await fixture(t);
    const target = new URL(IMAGE_README_PATH, root);
    const example = `${defaultRow.node}0`;

    await writeFile(target, `${await readFile(target, 'utf8')}\nHistorical example: ${example}\n`);
    await updateFiles(root, index([nextPatch(defaultRow.node)]), options);
    assert.ok((await readFile(target, 'utf8')).includes(`Historical example: ${example}`));
});

test('PR body lists every upgrade with release links', () => {
    const to = nextPatch(defaultRow.node);
    const body = buildPrBody([{ from: defaultRow.node, to }]);

    assert.ok(
        body.includes(
            `| ${defaultRow.node} | [${to}](https://nodejs.org/en/blog/release/v${to}) |`,
        ),
    );
    assert.match(buildPrBody([]), /No Node.js version updates/);
});
