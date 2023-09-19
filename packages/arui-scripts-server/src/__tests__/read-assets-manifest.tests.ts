import { readFile } from 'fs';

import { readAssetsManifest } from '../read-assets-manifest';

jest.mock('fs', () => ({
    readFile: jest.fn(),
}));

describe('readAssetsManifest', () => {
    it('should throw error if manifest file not found', async () => {
        (readFile as any).mockImplementationOnce(() => {
            throw new Error('File not found');
        });
        await expect(readAssetsManifest(['vendor', 'main'])).rejects.toThrowError();
    });

    it('should return js and css assets', async () => {
        (readFile as any).mockImplementationOnce((path: any, options: any, done: any) =>
            done(
                null,
                JSON.stringify({
                    vendor: {
                        js: 'vendor.js',
                        css: 'vendor.css',
                    },
                    main: {
                        js: 'main.js',
                        css: 'main.css',
                    },
                }),
            ),
        );

        const result = await readAssetsManifest(['vendor', 'main']);

        expect(result).toEqual({
            js: ['vendor.js', 'main.js'],
            css: ['vendor.css', 'main.css'],
        });
    });
});
