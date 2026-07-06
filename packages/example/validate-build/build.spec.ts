import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';

import React, { Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';

import {
    type BaseModuleState,
    type GetResourcesRequest,
    type ModuleResources,
} from '@alfalab/scripts-modules';
import { createSsrMounter } from '@alfalab/scripts-modules/ssr';

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

describe('ssr modules', () => {
    async function renderStream(children: React.ReactElement) {
        return new Promise<string>((resolve, reject) => {
            const output = new PassThrough();
            let html = '';

            output.on('data', (chunk) => {
                html += chunk.toString();
            });
            output.on('end', () => resolve(html));
            output.on('error', reject);

            const { pipe } = renderToPipeableStream(children, {
                onAllReady() {
                    pipe(output);
                },
                onError(error) {
                    reject(error);
                },
            });
        });
    }

    it('should render SSR module html and embedded resources payload', async () => {
        const getModuleResources = jest.fn(
            async (
                request: GetResourcesRequest<undefined>,
            ): Promise<ModuleResources<BaseModuleState>> => ({
                scripts: ['/assets/remoteEntry.js'],
                styles: [],
                moduleVersion: '1.0.0',
                appName: 'example_modules',
                mountMode: 'default',
                moduleState: {
                    baseUrl: 'http://localhost:8082',
                    hostAppId: request.hostAppId,
                },
                html: '<div id="server-state-ssr-html">Hello from module SSR</div>',
            }),
        );

        const { ModuleComponent } = createSsrMounter<
            { name: string; counter: number },
            { name: string; counter: number }
        >({
            moduleId: 'ServerStateModule',
            hostAppId: 'example',
            getModuleResources,
        });

        const html = await renderStream(
            React.createElement(
                Suspense,
                { fallback: React.createElement('span', null, 'loading') },
                React.createElement(ModuleComponent, {
                    instanceId: 'server-state-ssr-demo',
                    runParams: { name: 'Vasia', counter: 1 },
                    ssrRunParams: { name: 'Vasia', counter: 1 },
                }),
            ),
        );

        expect(getModuleResources).toHaveBeenCalledTimes(1);
        expect(getModuleResources).toHaveBeenCalledWith(
            expect.objectContaining({
                moduleId: 'ServerStateModule',
                hostAppId: 'example',
                ssr: { runParams: { name: 'Vasia', counter: 1 } },
            }),
            { signal: undefined },
        );
        expect(html).toContain('data-module-ssr-root="server-state-ssr-demo"');
        expect(html).toContain('data-module-mount-id="server-state-ssr-demo"');
        expect(html).toContain('id="server-state-ssr-html"');
        expect(html).toContain('data-module-ssr-payload="ServerStateModule"');
        expect(html).toContain('"scripts":["/assets/remoteEntry.js"]');
        expect(html).not.toContain('loading');
    });
});
