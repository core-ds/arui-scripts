import assert from 'node:assert/strict';
import { test } from 'node:test';

import { defaultImage, imageExists } from './docker-image.mjs';
import { waitForImage } from './wait-for-base-image.mjs';

const image = 'alfabankui/arui-scripts:24.0.0-slim';
const silent = () => {};

test('reads the actual configured default image', async () => {
    assert.match(await defaultImage(), /^alfabankui\/arui-scripts:\d+\.\d+\.\d+-slim$/);
});

test('inspects the exact image without a shell or downloading its layers', async () => {
    const exists = await imageExists(image, async (...args) => {
        assert.deepEqual(args, [
            'docker',
            ['buildx', 'imagetools', 'inspect', image],
            { timeout: 30_000 },
        ]);
    });

    assert.equal(exists, true);
});

test('only missing manifests are treated as unpublished images', async () => {
    for (const stderr of [
        'ERROR: manifest unknown',
        `ERROR: ${image}: not found`,
        'no such manifest',
    ]) {
        assert.equal(
            await imageExists(image, async () => {
                throw Object.assign(new Error(), { code: 1, stderr });
            }),
            false,
        );
    }
    for (const error of [
        Object.assign(new Error(), { code: 1, stderr: 'unauthorized: authentication required' }),
        Object.assign(new Error(), { code: 1, stderr: '429 Too Many Requests' }),
        Object.assign(new Error(), { code: 1, stderr: 'dial tcp: lookup registry: timeout' }),
        Object.assign(new Error('spawn docker ENOENT'), { code: 'ENOENT' }),
        Object.assign(new Error('Command timed out'), { code: null, killed: true }),
    ]) {
        await assert.rejects(
            imageExists(image, async () => {
                throw error;
            }),
            /Cannot inspect Docker image/,
        );
    }
});

test('an available image permits the release immediately', async () => {
    await waitForImage(image, {
        hasImage: async () => true,
        sleep: () => assert.fail('No wait needed'),
        log: silent,
    });
});

test('waits for image publication and then permits the release', async () => {
    let calls = 0;
    const pauses = [];

    await waitForImage(image, {
        hasImage: async (value) => {
            assert.equal(value, image);
            return ++calls === 3;
        },
        now: () => 0,
        sleep: async (ms) => {
            pauses.push(ms);
        },
        log: silent,
    });
    assert.deepEqual(pauses, [30_000, 30_000]);
    assert.equal(calls, 3);
});

test('stops the release when the deadline expires', async () => {
    let time = 0;
    const pauses = [];

    await assert.rejects(
        waitForImage(image, {
            hasImage: async () => false,
            now: () => time,
            sleep: async (ms) => {
                pauses.push(ms);
                time += ms;
            },
            timeoutMs: 50_000,
            log: silent,
        }),
        /[Tt]imed out waiting.*Check Build docker images/,
    );
    assert.deepEqual(pauses, [30_000, 20_000]);
});

test('registry errors stop the release instead of being hidden as missing images', async () => {
    await assert.rejects(
        waitForImage(image, {
            hasImage: async () => {
                throw new Error('unauthorized');
            },
            sleep: () => assert.fail('Do not hide registry errors'),
            log: silent,
        }),
        /unauthorized/,
    );
});
