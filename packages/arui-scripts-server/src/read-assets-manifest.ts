import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

type AruiAppManifest = {
    [key: string]: {
        js: string;
        css: string;
    };
}

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
    const js: string[] = [];
    const css: string[] = [];

    bundleNames.forEach((key) => {
        if (!manifest[key]) {
            return;
        }

        const script = manifest[key].js;
        if (script) {
            js.push(script);
        }

        const style = manifest[key].css;
        if (style) {
            css.push(style);
        }
    });

    return {
        js,
        css,
    };
}
