import fs from 'fs';
import path from 'path';

const BUILD_PATH = path.join(__dirname, '../.build');

async function fileExists(filePath: string) {
    try {
        const res = await fs.promises.stat(filePath);

        return res.isFile();
    } catch (e) {
        return false;
    }
}

describe('assets-manifest', () => {
    it('should have client assets manifest', async () => {
        const manifestPath = path.join(BUILD_PATH, 'assets/webpack-assets.json');

        expect(await fileExists(manifestPath)).toBe(true);
    });

    it('should have server assets manifest', async () => {
        const manifestPath = path.join(BUILD_PATH, 'webpack-assets.json');

        expect(await fileExists(manifestPath)).toBe(true);
    });

    it('should contain list of all assets', async () => {
        const manifestPath = path.join(BUILD_PATH, 'webpack-assets.json');
        const manifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));

        expect(manifest).toMatchObject({
            worker: {
                js: expect.any(String),
            },
            __metadata__: {
                version: expect.any(String),
                name: 'example',
            },
        });
    });
});

describe('server', () => {
    it('should have server entry', async () => {
        const serverEntryPath = path.join(BUILD_PATH, 'server.js');

        expect(await fileExists(serverEntryPath)).toBe(true);
    });
});

describe('client', () => {
    it('should create client entry', async () => {
        const assetsManifest = JSON.parse(
            await fs.promises.readFile(
                path.join(BUILD_PATH, 'assets/webpack-assets.json'),
                'utf-8',
            ),
        );

        const mainJsPath = path.join(BUILD_PATH, assetsManifest.main.js);

        expect(await fileExists(mainJsPath)).toBe(true);
    });

    it('should create valid css', async () => {
        const assetsManifest = JSON.parse(
            await fs.promises.readFile(
                path.join(BUILD_PATH, 'assets/webpack-assets.json'),
                'utf-8',
            ),
        );

        const moduleCssPath = path.join(BUILD_PATH, assetsManifest.main.css);

        expect(await fileExists(moduleCssPath)).toBe(true);
        expect(await fs.promises.readFile(moduleCssPath, 'utf-8')).toMatchSnapshot();
    });
});
