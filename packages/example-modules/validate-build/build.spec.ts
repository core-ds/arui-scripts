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
            FactoryModuleCompat: {
                js: expect.any(String),
            },
            Module: {
                mode: 'default',
                js: expect.any(String),
            },
            ServerStateFactoryModule: {
                mode: 'default',
                js: expect.any(String),
            },
            ModuleAbstract: {
                mode: 'default',
                js: expect.any(String),
            },
            ServerStateModuleCompat: {
                js: expect.any(String),
            },
            ModuleAbstractCompat: {
                js: expect.any(String),
            },
            ModuleCompat: {
                js: expect.any(String),
                css: expect.any(String),
            },
            main: {
                js: expect.any(String),
            },
            __metadata__: {
                version: expect.any(String),
                name: 'example_modules',
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
            await fs.promises.readFile(path.join(BUILD_PATH, 'assets/webpack-assets.json'), 'utf-8'),
        );

        const mainJsPath = path.join(BUILD_PATH, assetsManifest.main.js);

        expect(await fileExists(mainJsPath)).toBe(true);
    });
});

describe('modules', () => {
    const modules = [
        'Module',
        'ModuleAbstract',
        'ModuleCompat',
        'ModuleAbstractCompat',
        'FactoryModuleCompat',
        'ServerStateModuleCompat',
        'ServerStateFactoryModule',
    ];

    it.each(modules)('should create module %s entry point', async (moduleName) => {
        const assetsManifest = JSON.parse(
            await fs.promises.readFile(path.join(BUILD_PATH, 'assets/webpack-assets.json'), 'utf-8'),
        );

        const moduleJsPath = path.join(BUILD_PATH, assetsManifest[moduleName].js);
        expect(await fileExists(moduleJsPath)).toBe(true);

        if (assetsManifest[moduleName].css) {
            const moduleCssPath = path.join(BUILD_PATH, assetsManifest[moduleName].css);
            expect(await fileExists(moduleCssPath)).toBe(true);
        }
    });

    it('should create entry point for MF modules', async () => {
        const remoteEntryPath = path.join(BUILD_PATH, 'assets/remoteEntry.js');

        expect(await fileExists(remoteEntryPath)).toBe(true);
    });

    it('should create valid css for ModuleCompat', async () => {
        const assetsManifest = JSON.parse(
            await fs.promises.readFile(path.join(BUILD_PATH, 'assets/webpack-assets.json'), 'utf-8'),
        );

        const moduleCssPath = path.join(BUILD_PATH, assetsManifest.ModuleCompat.css);

        expect(await fileExists(moduleCssPath)).toBe(true);
        expect(await fs.promises.readFile(moduleCssPath, 'utf-8')).toMatchSnapshot();
    })
});
