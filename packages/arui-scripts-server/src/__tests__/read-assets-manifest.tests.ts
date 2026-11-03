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

    it('reads and caches a separate manifest for each explicit path', async () => {
        const readFileMock = readFile as unknown as jest.Mock;

        readFileMock.mockImplementation((filename, options, done) =>
            done(null, JSON.stringify({ main: { js: `${filename}.js` } })),
        );
        const firstPath = '/tmp/start-first/webpack-assets.json';
        const secondPath = '/tmp/start-second/webpack-assets.json';

        expect(await readAssetsManifest(['main'], firstPath)).toEqual({
            js: [`${firstPath}.js`],
            css: [],
        });
        expect(await readAssetsManifest(['main'], secondPath)).toEqual({
            js: [`${secondPath}.js`],
            css: [],
        });
        const calls = readFileMock.mock.calls.length;

        await readAssetsManifest(['main'], firstPath);
        expect(readFileMock.mock.calls.length).toBe(calls);
        expect(readFileMock).toHaveBeenCalledWith(firstPath, 'utf8', expect.any(Function));
        expect(readFileMock).toHaveBeenCalledWith(secondPath, 'utf8', expect.any(Function));
    });
});
