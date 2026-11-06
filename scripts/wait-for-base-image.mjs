import { setTimeout } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

import { defaultImage, imageExists } from './docker-image.mjs';

export async function waitForImage(
    image,
    {
        hasImage = imageExists,
        now = Date.now,
        sleep = setTimeout,
        timeoutMs = 30 * 60_000,
        intervalMs = 30_000,
        log = console.log,
    } = {},
) {
    const deadline = now() + timeoutMs;

    while (!(await hasImage(image))) {
        const remaining = deadline - now();

        if (remaining <= 0) {
            throw new Error(`timed out waiting for ${image}. Check Build docker images.`);
        }

        log(`Waiting for ${image} to be published...`);

        await sleep(Math.min(intervalMs, remaining));
    }

    log(`Base image ${image} is available.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await waitForImage(await defaultImage());
}
