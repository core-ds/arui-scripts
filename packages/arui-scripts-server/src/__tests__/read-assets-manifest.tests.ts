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
});
