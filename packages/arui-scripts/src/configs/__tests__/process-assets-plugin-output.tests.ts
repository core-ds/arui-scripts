import { type Assets } from 'assets-webpack-plugin';

import { configs } from '../app-configs';
import { asyncChunkGroupsManifest } from '../async-chunk-groups-manifest';
import { processAssetsPluginOutput } from '../process-assets-plugin-output';

jest.mock('../app-configs', () => ({
    configs: {
        publicPath: 'assets/',
        version: '1.0.0',
        normalizedName: 'test_app',
    },
}));

type Manifest = Record<string, { js?: string | string[]; css?: string | string[] }>;

function processOutput(assets: Assets): Manifest {
    return JSON.parse(processAssetsPluginOutput(assets));
}

describe('processAssetsPluginOutput', () => {
    afterEach(() => {
        asyncChunkGroupsManifest.clear();
        configs.publicPath = 'assets/';
    });

    it('keeps the entries of the assets plugin output untouched', () => {
        const manifest = processOutput({
            main: { js: 'auto/main.js', css: 'auto/main.css' },
            vendor: { js: ['auto/vendor.js'] },
        } as unknown as Assets);

        expect(manifest.main).toEqual({ js: 'assets/main.js', css: 'assets/main.css' });
        expect(manifest.vendor).toEqual({ js: ['assets/vendor.js'] });
    });

    it('adds full file lists of async chunk groups with public path', () => {
        asyncChunkGroupsManifest.set('page-a', {
            publicPath: 'assets/',
            js: ['787.chunk.js', 'page-a.chunk.js'],
            css: ['page-a.chunk.css'],
        });

        const manifest = processOutput({} as Assets);

        expect(manifest['page-a']).toEqual({
            js: ['assets/787.chunk.js', 'assets/page-a.chunk.js'],
            css: ['assets/page-a.chunk.css'],
        });
    });

    it('replaces the own-files-only record of the same chunk name', () => {
        asyncChunkGroupsManifest.set('page-a', {
            publicPath: 'assets/',
            js: ['787.chunk.js', 'page-a.chunk.js'],
            css: [],
        });

        const manifest = processOutput({
            'page-a': { js: 'auto/page-a.chunk.js', css: 'auto/page-a.chunk.css' },
        } as unknown as Assets);

        expect(manifest['page-a']).toEqual({
            js: ['assets/787.chunk.js', 'assets/page-a.chunk.js'],
        });
    });

    it('omits css key for a group without css', () => {
        asyncChunkGroupsManifest.set('page-a', {
            js: ['page-a.chunk.js'],
            css: [],
            publicPath: 'assets/',
        });

        expect(processOutput({} as Assets)['page-a']).not.toHaveProperty('css');
    });

    it.each(['https://cdn.example.com/assets/', '//cdn.example.com/assets/'])(
        'resolves auto using the configured public path %s without changing the URL',
        (publicPath) => {
            configs.publicPath = publicPath;
            asyncChunkGroupsManifest.set('page-a', {
                js: ['page-a.chunk.js'],
                css: ['page-a.chunk.css'],
                publicPath: 'auto',
            });

            expect(processOutput({} as Assets)['page-a']).toEqual({
                js: [`${publicPath}page-a.chunk.js`],
                css: [`${publicPath}page-a.chunk.css`],
            });
        },
    );
});
