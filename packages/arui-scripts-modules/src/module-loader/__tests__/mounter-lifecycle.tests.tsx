import React, { StrictMode } from 'react';
import { act, render, waitFor } from '@testing-library/react';

import { createSsrMounter } from '../../ssr/create-ssr-mounter';
import { createLazyMounter } from '../create-lazy-mounter';
import { useModuleMounter } from '../hooks/use-module-mounter';
import {
    type ModuleLifecycleContext,
    type ModuleMounterOptions,
    type MountableModule,
} from '../module-types';
import { type ModuleResources } from '../types';

const resources: ModuleResources = {
    scripts: [],
    styles: [],
    moduleVersion: '1',
    appName: 'LifecycleTest',
    mountMode: 'compat',
    moduleState: { baseUrl: '/', hostAppId: 'host' },
};

describe.each(['hook', 'lazy', 'ssr'] as const)('Жизненный цикл mounter-а: %s', (kind) => {
    afterEach(() => {
        delete (window as unknown as Record<string, unknown>).LifecycleTest;
    });

    async function makeComponent(
        module: MountableModule<{ value: string }>,
        options: ModuleMounterOptions,
    ) {
        const release = jest.fn();
        const loader = jest
            .fn()
            .mockResolvedValue({ module, moduleResources: resources, unmount: release });

        if (kind === 'lazy') {
            const { default: Component } = await createLazyMounter({ loader, ...options })();

            return { Component, release };
        }
        if (kind === 'ssr') {
            (window as unknown as Record<string, unknown>).LifecycleTest = module;
            const { ModuleComponent } = createSsrMounter<{ value: string }>({
                moduleId: 'LifecycleTest',
                hostAppId: 'host',
                getModuleResources: async () => resources,
                hooks: {
                    onBeforeModuleMount() {
                        (window as unknown as Record<string, unknown>).LifecycleTest = module;
                    },
                },
            });
            const Component = (params: { value: string }) => (
                <ModuleComponent runParams={params} {...options} />
            );

            return { Component, release };
        }
        const Component = (params: { value: string }) => {
            const { targetElementRef, loadingState } = useModuleMounter({
                loader,
                runParams: params,
                ...options,
            });

            return (
                <div>
                    <span data-testid='state'>{loadingState}</span>
                    <div ref={targetElementRef} />
                </div>
            );
        };

        return { Component, release };
    }

    it('ожидает явной готовности, обновляет модуль и однократно сообщает об ошибках выполнения', async () => {
        let context!: ModuleLifecycleContext;
        const onReady = jest.fn();
        const onError = jest.fn();
        const module: MountableModule<{ value: string }> = {
            readiness: 'explicit',
            mount: jest.fn((_t, _p, _s, ctx) => {
                context = ctx!;
            }),
            update: jest.fn(),
            unmount: jest.fn(),
        };
        const { Component } = await makeComponent(module, { onReady, onError });
        const view = render(<Component value='a' />);

        await waitFor(() => expect(module.mount).toHaveBeenCalledTimes(1));
        expect(onReady).not.toHaveBeenCalled();
        act(() => context.reportReady());
        expect(onReady).toHaveBeenCalledTimes(1);
        view.rerender(<Component value='b' />);
        await waitFor(() =>
            expect(module.update).toHaveBeenCalledWith(
                expect.any(HTMLElement),
                { value: 'b' },
                resources.moduleState,
                context,
            ),
        );
        const error = new Error('runtime');

        act(() => context.reportError(error));
        expect(onError).toHaveBeenCalledWith({ error, stage: 'runtime' });
        expect(module.unmount).toHaveBeenCalledTimes(1);
        view.unmount();
        expect(module.unmount).toHaveBeenCalledTimes(1);
        act(() => {
            context.reportReady();
            context.reportError(error);
        });
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it('перехватывает отклонение Promise из update и освобождает сломавшийся экземпляр', async () => {
        const error = new Error('update');
        const onError = jest.fn();
        const module: MountableModule<{ value: string }> = {
            mount: jest.fn(),
            update: jest.fn().mockRejectedValue(error),
            unmount: jest.fn(),
        };
        const { Component } = await makeComponent(module, { onError });
        const view = render(<Component value='a' />);

        await waitFor(() => expect(module.mount).toHaveBeenCalledTimes(1));
        view.rerender(<Component value='b' />);
        await waitFor(() => expect(onError).toHaveBeenCalledWith({ error, stage: 'update' }));
        expect(module.unmount).toHaveBeenCalledTimes(1);
        view.rerender(<Component value='c' />);
        expect(module.update).toHaveBeenCalledTimes(1);
    });

    it('игнорирует готовность отменённого запуска в StrictMode', async () => {
        const contexts: ModuleLifecycleContext[] = [];
        const onReady = jest.fn();
        const module: MountableModule<{ value: string }> = {
            readiness: 'explicit',
            mount: (_t, _p, _s, ctx) => {
                contexts.push(ctx!);
            },
            unmount() {},
        };
        const { Component } = await makeComponent(module, { onReady });
        const view = render(
            <StrictMode>
                <Component value='a' />
            </StrictMode>,
        );

        await waitFor(() => expect(contexts.length).toBeGreaterThan(0));
        view.unmount();
        act(() => contexts.forEach((context) => context.reportReady()));
        expect(onReady).not.toHaveBeenCalled();
        expect(contexts.every((context) => context.signal.aborted)).toBe(true);
    });

    if (kind === 'lazy') {
        it('не перезапускает сломавшийся модуль без update при изменении пропсов', async () => {
            let context!: ModuleLifecycleContext;
            const module: MountableModule<{ value: string }> = {
                mount: jest.fn((_t, _p, _s, ctx) => {
                    context = ctx!;
                }),
                unmount() {},
            };
            const { Component } = await makeComponent(module, { onError: jest.fn() });
            const view = render(<Component value='a' />);

            await waitFor(() => expect(module.mount).toHaveBeenCalledTimes(1));
            act(() => context.reportError(new Error('failed')));
            view.rerender(<Component value='b' />);
            await act(async () => {
                await Promise.resolve();
            });
            expect(module.mount).toHaveBeenCalledTimes(1);
        });
        it('сохраняет общие ресурсы, пока другой lazy-экземпляр остаётся активным', async () => {
            const contexts: ModuleLifecycleContext[] = [];
            const module: MountableModule<{ value: string }> = {
                mount: (_t, _p, _s, context) => {
                    contexts.push(context!);
                },
                unmount: jest.fn(),
            };
            const { Component, release } = await makeComponent(module, { onError: jest.fn() });
            const view = render(
                <React.Fragment>
                    <Component value='a' />
                    <Component value='b' />
                </React.Fragment>,
            );

            await waitFor(() => expect(contexts).toHaveLength(2));
            act(() => contexts[0].reportError(new Error('one instance failed')));
            await act(async () => {
                await Promise.resolve();
            });
            expect(release).not.toHaveBeenCalled();
            expect(module.unmount).toHaveBeenCalledTimes(1);
            view.unmount();
            await waitFor(() => expect(release).toHaveBeenCalledTimes(1));
            expect(module.unmount).toHaveBeenCalledTimes(2);
        });
    }
});
