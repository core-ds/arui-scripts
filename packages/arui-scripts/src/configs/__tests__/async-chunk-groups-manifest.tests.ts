import fs from 'fs';
import os from 'os';
import path from 'path';

import {
    type Compiler,
    type Configuration,
    rspack,
    type RspackPluginInstance,
    type Stats,
} from '@rspack/core';
import AssetsPlugin from 'assets-webpack-plugin';

import { AsyncChunkGroupsPlugin } from '../../plugins/async-chunk-groups';
import { asyncChunkGroupsManifest } from '../async-chunk-groups-manifest';
import { processAssetsPluginOutput } from '../process-assets-plugin-output';

jest.mock('../app-configs', () => ({
    configs: { publicPath: 'assets/', version: '1.0.0', normalizedName: 'test_app' },
}));

function run(compiler: Compiler): Promise<Stats> {
    return new Promise((resolve, reject) => {
        compiler.run((error, stats) => {
            if (error || !stats) {
                reject(error || new Error('Compilation did not return stats'));
            } else if (stats.hasErrors()) {
                reject(new Error(stats.toString({ all: false, errors: true })));
            } else {
                resolve(stats);
            }
        });
    });
}

describe('async chunk groups manifest integration', () => {
    let directory: string;
    let compiler: Compiler | undefined;

    beforeEach(() => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-async-manifest-'));
        const files = {
            'index.js': `
                globalThis.loadA = () => import(/* webpackChunkName: "page-a" */ './page-a.js');
                globalThis.loadB = () => import(/* webpackChunkName: "page-b" */ './page-b.js');
            `,
            'page-a.js':
                'import { value } from "./shared.js"; import "./page-a.css"; console.log(value);',
            'page-b.js': 'import { value } from "./shared.js"; console.log(value);',
            'shared.js': 'import "./shared.css"; export const value = globalThis.sharedValue;',
            'page-a.css': '.page { color: red; }',
            'shared.css': '.shared { color: blue; }',
        };

        Object.entries(files).forEach(([name, content]) => {
            fs.writeFileSync(path.join(directory, name), content);
        });
    });

    afterEach(async () => {
        if (compiler) {
            const currentCompiler = compiler;

            await new Promise<void>((resolve, reject) => {
                currentCompiler.close((error) => (error ? reject(error) : resolve()));
            });
            compiler = undefined;
        }
        asyncChunkGroupsManifest.clear();
        fs.rmSync(directory, { recursive: true, force: true });
    });

    function createCompiler(
        publicPath: string,
        entry: Configuration['entry'] = { main: './index.js' },
    ) {
        const outputPath = path.join(directory, 'output');

        compiler = rspack({
            mode: 'production',
            target: 'web',
            context: directory,
            entry,
            devtool: false,
            experiments: { css: true },
            output: {
                path: outputPath,
                publicPath,
                filename: '[name].[contenthash:8].js',
                chunkFilename: '[name].[contenthash:8].chunk.js',
                cssFilename: '[name].[contenthash:8].css',
                cssChunkFilename: '[name].[contenthash:8].chunk.css',
                clean: true,
            },
            module: {
                rules: [{ test: /\.css$/, type: 'css' }],
            },
            optimization: {
                minimize: false,
                concatenateModules: false,
                splitChunks: {
                    minSize: 0,
                    cacheGroups: {
                        default: false,
                        defaultVendors: false,
                        shared: { test: /shared\.(js|css)$/, minChunks: 2, enforce: true },
                    },
                },
            },
            plugins: [
                new AssetsPlugin({
                    path: outputPath,
                    processOutput: processAssetsPluginOutput,
                }) as unknown as RspackPluginInstance,
                new AsyncChunkGroupsPlugin(asyncChunkGroupsManifest),
            ],
        });

        return compiler;
    }

    function readManifest(): Record<string, { js?: string | string[]; css?: string | string[] }> {
        return JSON.parse(
            fs.readFileSync(path.join(directory, 'output/webpack-assets.json'), 'utf8'),
        );
    }

    it.each([
        'assets/',
        '/static/',
        'https://cdn.example.com/assets/',
        'https://cdn.example.com/assets',
        '//cdn.example.com/assets/',
        'https://cdn.example.com/[fullhash:8]/',
        '',
        'auto',
    ])('uses the compilation publicPath %j for all shared and own files', async (publicPath) => {
        const stats = await run(createCompiler(publicPath));
        const { namedChunkGroups } = stats.toJson({
            all: false,
            chunkGroups: true,
        });
        const files = namedChunkGroups?.['page-a'].assets?.map((asset) => asset.name) ?? [];
        const mainFile = namedChunkGroups?.main.assets?.find((asset) =>
            asset.name.endsWith('.js'),
        )?.name;
        const manifest = readManifest();

        if (!mainFile || typeof manifest.main.js !== 'string') {
            throw new Error('Missing main entrypoint script');
        }

        // Префикс берем из обычной записи AssetsPlugin, которую новый плагин не меняет.
        const prefix = manifest.main.js.slice(0, -mainFile.length);

        expect(files.filter((file) => file.endsWith('.js'))).toHaveLength(2);
        expect(files.filter((file) => file.endsWith('.css'))).toHaveLength(2);
        expect(manifest['page-a']).toEqual({
            js: files.filter((file) => file.endsWith('.js')).map((file) => `${prefix}${file}`),
            css: files.filter((file) => file.endsWith('.css')).map((file) => `${prefix}${file}`),
        });
    });

    it('does not overwrite an entrypoint with an async group from the previous compilation', async () => {
        let isEntrypoint = false;
        const currentCompiler = createCompiler(
            'assets/',
            (): Record<string, string> =>
                isEntrypoint ? { 'page-a': './page-a.js' } : { main: './index.js' },
        );

        await run(currentCompiler);
        asyncChunkGroupsManifest.set('other-build', {
            js: ['other-build.js'],
            css: [],
            publicPath: 'assets/',
        });
        isEntrypoint = true;
        const stats = await run(currentCompiler);
        const files = stats.toJson({ all: false, entrypoints: true }).entrypoints?.['page-a']
            .assets;

        expect(Array.from(asyncChunkGroupsManifest.keys())).toEqual(['other-build']);
        expect(readManifest()['page-a']).toEqual({
            js: `assets/${files?.find((asset) => asset.name.endsWith('.js'))?.name}`,
            css: `assets/${files?.find((asset) => asset.name.endsWith('.css'))?.name}`,
        });
    });
});
