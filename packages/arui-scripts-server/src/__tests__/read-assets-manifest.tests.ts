import { readFile } from 'fs';

import { readAssetsManifest } from '../read-assets-manifest';

jest.mock('fs', () => ({
    readFile: jest.fn(),
}));

describe('readAssetsManifest', () => {
    it('should throw error if manifest file not found', async () => {
        (readFile as unknown as jest.Mock).mockImplementationOnce(() => {
            throw new Error('File not found');
        });
        await expect(readAssetsManifest(['vendor', 'main'])).rejects.toThrowError();
    });

    it('should return js and css assets', async () => {
        (readFile as unknown as jest.Mock).mockImplementationOnce((path, options, done) =>
            done(
                null,
                JSON.stringify({
                    vendor: {
                        js: 'vendor.js',
                        css: 'vendor.css',
                    },
                    main: {
                        js: ['main1.js', 'main2.js'],
                        css: 'main.css',
                    },
                }),
            ),
        );

        const result = await readAssetsManifest(['vendor', 'main']);

        expect(result).toEqual({
            js: ['vendor.js', 'main1.js', 'main2.js'],
            css: ['vendor.css', 'main.css'],
        });
    });

    it('should not repeat files shared between bundles', async () => {
        let isolatedReadAssetsManifest: typeof readAssetsManifest = readAssetsManifest;
        let isolatedReadFile: jest.Mock = readFile as unknown as jest.Mock;

        // манифест кешируется на уровне модуля, поэтому берем чистый экземпляр модуля
        jest.isolateModules(() => {
            isolatedReadAssetsManifest =
                jest.requireActual('../read-assets-manifest').readAssetsManifest;
            isolatedReadFile = jest.requireMock('fs').readFile;
        });

        isolatedReadFile.mockImplementationOnce((path, options, done) =>
            done(
                null,
                JSON.stringify({
                    vendor: { js: 'vendor.js', css: 'vendor.css' },
                    'page-a': { js: ['shared.js', 'page-a.js'], css: ['shared.css', 'page-a.css'] },
                    'page-b': { js: ['shared.js', 'page-b.js'], css: ['shared.css'] },
                }),
            ),
        );

        const result = await isolatedReadAssetsManifest(['vendor', 'page-a', 'page-b']);

        expect(result).toEqual({
            js: ['vendor.js', 'shared.js', 'page-a.js', 'page-b.js'],
            css: ['vendor.css', 'shared.css', 'page-a.css'],
        });
    });
});
