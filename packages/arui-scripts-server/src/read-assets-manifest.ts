import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

const DEFAULT_BUNDLE_NAMES = ['vendor', 'main'];

export async function readAssetsManifest(bundleNames: string[] = DEFAULT_BUNDLE_NAMES) {
    const manifestPath = path.join(process.cwd(), '.build/webpack-assets.json');
    const fileContent = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(fileContent);
    const js: string[] = [];
    const css: string[] = [];

    bundleNames.forEach((key) => {
        if (!manifest[key]) {
            return;
        }

        if (manifest[key].js) {
            js.push(manifest[key].js);
        }

        if (manifest[key].css) {
            css.push(manifest[key].css);
        }
    });

    return {
        js,
        css,
    };
}
