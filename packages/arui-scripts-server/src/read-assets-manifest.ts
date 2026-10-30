import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import { type AruiAppManifest } from '@alfalab/scripts-modules';

const readFile = promisify(fs.readFile);

const DEFAULT_BUNDLE_NAMES = ['vendor', 'internalVendor', 'main'];

const appManifests = new Map<string, AruiAppManifest>();

export async function getAppManifest(
    manifestPath = path.join(process.cwd(), '.build/webpack-assets.json'),
) {
    const cached = appManifests.get(manifestPath);

    if (cached) return cached;

    const fileContent = await readFile(manifestPath, 'utf8');
    const appManifest = JSON.parse(fileContent) as AruiAppManifest;

    appManifests.set(manifestPath, appManifest);

    return appManifest;
}

export async function readAssetsManifest(
    bundleNames: string[] = DEFAULT_BUNDLE_NAMES,
    manifestPath?: string,
) {
    const manifest = await getAppManifest(manifestPath);
    let jsArray: string[] = [];
    let cssArray: string[] = [];

    bundleNames.forEach((key) => {
        if (!manifest[key]) return;

        const { js, css } = manifest[key];

        if (js) jsArray = jsArray.concat(js);
        if (css) cssArray = cssArray.concat(css);
    });

    return {
        js: jsArray,
        css: cssArray,
    };
}
