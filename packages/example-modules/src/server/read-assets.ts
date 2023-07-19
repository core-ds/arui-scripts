import path from "path";
import fs from "fs";

export function readAssetsManifest() {
    const manifestPath = path.join(process.cwd(), '.build/webpack-assets.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const js: string[] = [];
    const css: string[] = [];
    ['vendor', 'main'].forEach((key) => {
        if (!manifest[key]) {
            return;
        }
        if (manifest[key].js) {
            js.push(manifest[key].js.replace(/^auto/, 'assets'));
        }
        if (manifest[key].css) {
            css.push(manifest[key].css.replace(/^auto/, 'assets'));
        }
    });

    return {
        js, css
    };
}
