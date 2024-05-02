import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import type { AruiAppManifest } from '@alfalab/scripts-modules';

const readFile = promisify(fs.readFile);

const DEFAULT_BUNDLE_NAMES = ['vendor', 'internalVendor', 'main'];

let appManifest: AruiAppManifest;

export async function getAppManifest() {
    if (!appManifest) {
        const manifestPath = path.join(process.cwd(), '.build/webpack-assets.json');
        const fileContent = await readFile(manifestPath, 'utf8');

        appManifest = JSON.parse(fileContent);
    }

    return appManifest;
}

export async function readAssetsManifest(bundleNames: string[] = DEFAULT_BUNDLE_NAMES) {
    const manifest = await getAppManifest();
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
