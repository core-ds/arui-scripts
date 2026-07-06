import { Writable } from 'stream';

import React, { Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { type renderToPipeableStream as RenderToPipeableStream } from 'react-dom/server';
import { act, waitFor } from '@testing-library/react';

import { type ModuleResources } from '../../module-loader/types';
import { createSsrMounter } from '../create-ssr-mounter';
import { resetSuspenseResourceCache } from '../suspense-resource-cache';

// В jsdom `react-dom/server` резолвится в browser-сборку без renderToPipeableStream — берём node-сборку.
const { renderToPipeableStream } =
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    require('react-dom/server.node') as { renderToPipeableStream: typeof RenderToPipeableStream };

const MODULE_ID = 'ServerStateModule';
const INSTANCE_ID = 'i1';

type RunParams = { name: string; onClick?: () => void };

const moduleState = { baseUrl: 'https://module.example.com/app/', hostAppId: 'host' };

const buildResources = (overrides: Partial<ModuleResources> = {}): ModuleResources => ({
    scripts: [],
    styles: [],
    moduleVersion: '1.0.0',
    appName: MODULE_ID,
    mountMode: 'compat',
    moduleState,
    html: '<span data-testid="ssr">Hello from server</span>',
    ...overrides,
});

/** Рендерит дерево «на сервере» (без window), собирая полный HTML после резолва Suspense. */
function renderServerHtml(element: React.ReactElement): Promise<string> {
    const originalWindow = global.window;

    // @ts-expect-error — эмулируем серверное окружение без window
    delete global.window;

    return new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const writable = new Writable({
            write(chunk, _encoding, callback) {
                chunks.push(Buffer.from(chunk));
                callback();
            },
        });

        writable.on('finish', () => resolve(Buffer.concat(chunks).toString('utf8')));
        writable.on('error', reject);

        const { pipe } = renderToPipeableStream(element, {
            onAllReady() {
                pipe(writable);
            },
            onShellError: reject,
        });
    }).finally(() => {
        global.window = originalWindow;
    });
}

describe('createSsrMounter', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        resetSuspenseResourceCache();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        delete (window as unknown as Record<string, unknown>)[MODULE_ID];
        jest.restoreAllMocks();
    });

    it('server renders styles, outlet html and embedded payload', async () => {
        const getModuleResources = jest
            .fn()
            .mockResolvedValue(buildResources({ styles: ['static/main.css'] }));
        const { ModuleComponent } = createSsrMounter<RunParams>({
            moduleId: MODULE_ID,
            hostAppId: 'host',
            getModuleResources,
            fetchStyleContent: async () => '.a{color:red}',
        });

        const html = await renderServerHtml(
            <Suspense fallback={<span>loading</span>}>
                <ModuleComponent instanceId={INSTANCE_ID} ssrRunParams={{ name: 'Vasia' }} />
            </Suspense>,
        );

        // запрос ушёл с флагом ssr
        expect(getModuleResources).toHaveBeenCalledWith(
            expect.objectContaining({
                moduleId: MODULE_ID,
                ssr: { runParams: { name: 'Vasia' } },
            }),
            expect.anything(),
        );
        // html модуля
        expect(html).toContain('Hello from server');
        // инлайн-стиль с ssr-href
        expect(html).toContain(
            'data-module-ssr-href="https://module.example.com/app/static/main.css"',
        );
        expect(html).toContain('.a{color:red}');
        // payload без html
        expect(html).toContain(`data-module-ssr-payload="${MODULE_ID}"`);
        expect(html).toContain(`data-module-instance="${INSTANCE_ID}"`);
        expect(html).not.toContain('"html"');
    });

    it('uses inline styles by default on the server', async () => {
        const fetchStyleContent = jest.fn().mockResolvedValue('.a{color:red}');
        const getModuleResources = jest
            .fn()
            .mockResolvedValue(buildResources({ styles: ['static/main.css'] }));

        const { ModuleComponent } = createSsrMounter<RunParams>({
            moduleId: MODULE_ID,
            hostAppId: 'host',
            getModuleResources,
            fetchStyleContent,
        });

        const html = await renderServerHtml(
            <Suspense fallback={<span>loading</span>}>
                <ModuleComponent instanceId={INSTANCE_ID} ssrRunParams={{ name: 'Vasia' }} />
            </Suspense>,
        );

        expect(fetchStyleContent).toHaveBeenCalledWith(
            'https://module.example.com/app/static/main.css',
        );
        expect(html).toContain('<style');
        expect(html).toContain('data-parent-app-id="ServerStateModule"');
        expect(html).toContain(
            'data-module-ssr-href="https://module.example.com/app/static/main.css"',
        );
        expect(html).toContain('.a{color:red}');
        expect(html).not.toContain('rel="stylesheet"');
    });

    it('can render server styles as stylesheet links', async () => {
        const fetchStyleContent = jest.fn().mockResolvedValue('.a{color:red}');
        const getModuleResources = jest
            .fn()
            .mockResolvedValue(buildResources({ styles: ['static/main.css'] }));

        const { ModuleComponent } = createSsrMounter<RunParams>({
            moduleId: MODULE_ID,
            hostAppId: 'host',
            getModuleResources,
            fetchStyleContent,
            stylesMode: 'link',
        });

        const html = await renderServerHtml(
            <Suspense fallback={<span>loading</span>}>
                <ModuleComponent instanceId={INSTANCE_ID} ssrRunParams={{ name: 'Vasia' }} />
            </Suspense>,
        );

        expect(fetchStyleContent).not.toHaveBeenCalled();
        expect(html).toContain('<link');
        expect(html).toContain('rel="stylesheet"');
        expect(html).toContain('type="text/css"');
        expect(html).toContain('href="https://module.example.com/app/static/main.css"');
        expect(html).toContain('data-parent-app-id="ServerStateModule"');
        expect(html).toContain(
            'data-module-ssr-href="https://module.example.com/app/static/main.css"',
        );
        expect(html).not.toContain('.a{color:red}');
    });

    it('hydrates server markup on the client without a second resources request', async () => {
        const getModuleResources = jest.fn().mockResolvedValue(buildResources());
        const module = {
            hydrate: jest.fn(),
            mount: jest.fn(),
            unmount: jest.fn(),
        };

        (window as unknown as Record<string, unknown>)[MODULE_ID] = module;

        const { ModuleComponent } = createSsrMounter<RunParams>({
            moduleId: MODULE_ID,
            hostAppId: 'host',
            getModuleResources,
        });

        const runParams: RunParams = { name: 'Vasia' };
        const element = (
            <Suspense fallback={<span>loading</span>}>
                <ModuleComponent
                    instanceId={INSTANCE_ID}
                    ssrRunParams={{ name: 'Vasia' }}
                    runParams={runParams}
                />
            </Suspense>
        );

        const html = await renderServerHtml(element);

        expect(getModuleResources).toHaveBeenCalledTimes(1);

        container.innerHTML = html;

        await act(async () => {
            hydrateRoot(container, element);
        });

        await waitFor(() => {
            expect(module.hydrate).toHaveBeenCalled();
        });

        // гидрация в outlet с серверной разметкой
        const [target, passedRunParams, passedState] = module.hydrate.mock.calls[0];

        expect(target.getAttribute('data-module-mount-id')).toBe(INSTANCE_ID);
        expect(target.innerHTML).toContain('Hello from server');
        expect(passedRunParams).toEqual(runParams);
        expect(passedState).toEqual(moduleState);

        // mount не вызывается, повторного запроса ресурсов нет
        expect(module.mount).not.toHaveBeenCalled();
        expect(getModuleResources).toHaveBeenCalledTimes(1);
    });

    it('falls back to mount (clearing the outlet) when the module has no hydrate', async () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        const getModuleResources = jest.fn().mockResolvedValue(buildResources());
        const module = { mount: jest.fn(), unmount: jest.fn() };

        (window as unknown as Record<string, unknown>)[MODULE_ID] = module;

        const { ModuleComponent } = createSsrMounter<RunParams>({
            moduleId: MODULE_ID,
            hostAppId: 'host',
            getModuleResources,
        });

        const element = (
            <Suspense fallback={<span>loading</span>}>
                <ModuleComponent
                    instanceId={INSTANCE_ID}
                    ssrRunParams={{ name: 'Vasia' }}
                    runParams={{ name: 'Vasia' }}
                />
            </Suspense>
        );

        const html = await renderServerHtml(element);

        container.innerHTML = html;

        await act(async () => {
            hydrateRoot(container, element);
        });

        await waitFor(() => {
            expect(module.mount).toHaveBeenCalled();
        });

        const [target] = module.mount.mock.calls[0];

        // outlet очищен перед mount
        expect(target.innerHTML).toBe('');
        expect(getModuleResources).toHaveBeenCalledTimes(1);
    });

    it('updates the module on runParams change via update()', async () => {
        const getModuleResources = jest.fn().mockResolvedValue(buildResources());
        const module = {
            hydrate: jest.fn(),
            mount: jest.fn(),
            unmount: jest.fn(),
            update: jest.fn(),
        };

        (window as unknown as Record<string, unknown>)[MODULE_ID] = module;

        const { ModuleComponent } = createSsrMounter<RunParams>({
            moduleId: MODULE_ID,
            hostAppId: 'host',
            getModuleResources,
        });

        const makeElement = (runParams: RunParams) => (
            <Suspense fallback={<span>loading</span>}>
                <ModuleComponent
                    instanceId={INSTANCE_ID}
                    ssrRunParams={{ name: 'Vasia' }}
                    runParams={runParams}
                />
            </Suspense>
        );

        const html = await renderServerHtml(makeElement({ name: 'Vasia' }));

        container.innerHTML = html;

        let root: ReturnType<typeof hydrateRoot>;

        await act(async () => {
            root = hydrateRoot(container, makeElement({ name: 'Vasia' }));
        });

        await waitFor(() => {
            expect(module.hydrate).toHaveBeenCalled();
        });

        await act(async () => {
            root.render(makeElement({ name: 'Petya' }));
        });

        await waitFor(() => {
            expect(module.update).toHaveBeenCalledWith(
                expect.anything(),
                { name: 'Petya' },
                moduleState,
            );
        });
        // повторного монтирования не было
        expect(module.hydrate).toHaveBeenCalledTimes(1);
        expect(module.mount).not.toHaveBeenCalled();
    });

    it('throws when useShadowDom is combined with SSR on the client', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const getModuleResources = jest.fn().mockResolvedValue(buildResources());
        const { ModuleComponent } = createSsrMounter<RunParams>({
            moduleId: MODULE_ID,
            hostAppId: 'host',
            getModuleResources,
        });

        expect(() =>
            renderToStaticClient(<ModuleComponent instanceId={INSTANCE_ID} useShadowDom={true} />),
        ).toThrow(/shadow DOM/);
    });
});

// Небольшой помощник: синхронно рендерит клиентский компонент, пробрасывая ошибки рендера.
function renderToStaticClient(element: React.ReactElement) {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { renderToStaticMarkup } = require('react-dom/server');

    return renderToStaticMarkup(element);
}
