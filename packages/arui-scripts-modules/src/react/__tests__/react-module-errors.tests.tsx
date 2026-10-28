import React, { StrictMode, useEffect } from 'react';
import { act, render, waitFor } from '@testing-library/react';

import { useModuleMounter } from '../../module-loader/hooks/use-module-mounter';
import { type ModuleResources } from '../../module-loader/types';
import { createReactModule, type ReactModuleProps, useModuleReady } from '..';

const state = { baseUrl: '/', hostAppId: 'host' };

describe('Ошибки и очистка React-модуля', () => {
    let target: HTMLDivElement;
    let cleanups: Array<() => void>;
    let consoleError: jest.SpyInstance;

    beforeEach(() => {
        target = document.createElement('div');
        document.body.appendChild(target);
        cleanups = [];
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(async () => {
        await act(async () => {
            cleanups.forEach((cleanup) => cleanup());
        });
        target.remove();
        consoleError.mockRestore();
    });

    const context = () => ({
        signal: new AbortController().signal,
        reportReady: jest.fn(),
        reportError: jest.fn(),
    });

    it.each(['render', 'effect'] as const)(
        'сообщает исходную ошибку %s и подавляет готовность',
        async (stage) => {
            const error = new Error(stage);

            function App() {
                useModuleReady();
                useEffect(() => {
                    if (stage === 'effect') throw error;
                }, []);
                if (stage === 'render') throw error;

                return <span>ready</span>;
            }
            const module = createReactModule({ Component: App });
            const ctx = context();

            cleanups.push(() => module.unmount(target));
            await act(async () => {
                module.mount(target, undefined, state, ctx);
            });
            expect(ctx.reportError).toHaveBeenCalledTimes(1);
            expect(ctx.reportError).toHaveBeenCalledWith(error);
            expect(ctx.reportReady).not.toHaveBeenCalled();
            expect(target.textContent).toBe('');
        },
    );

    it('сообщает об ошибке обновления после успешной готовности', async () => {
        const error = new Error('update');

        function App({ runParams }: ReactModuleProps<boolean>) {
            if (runParams) throw error;

            return <span>ready</span>;
        }
        const module = createReactModule({ Component: App });
        const ctx = context();

        cleanups.push(() => module.unmount(target));
        await act(async () => {
            module.mount(target, false, state, ctx);
        });
        await act(async () => {
            module.update!(target, true, state, ctx);
        });
        expect(ctx.reportReady).toHaveBeenCalledTimes(1);
        expect(ctx.reportError).toHaveBeenCalledTimes(1);
        expect(ctx.reportError).toHaveBeenCalledWith(error);
    });

    it('выводит ошибку в консоль, если контекст хоста отсутствует', async () => {
        const error = new Error('standalone');
        const module = createReactModule({
            Component: () => {
                throw error;
            },
        });

        cleanups.push(() => module.unmount(target));
        await act(async () => {
            module.mount(target, undefined, state);
        });
        expect(consoleError).toHaveBeenCalledWith(error);
    });

    it('очищает root после commit хоста без предупреждений и переживает StrictMode', async () => {
        const module = createReactModule({ Component: () => <span>ready</span> });
        const reports: Array<ReturnType<typeof context>> = [];

        function Host() {
            useEffect(() => {
                const ctx = context();

                reports.push(ctx);
                module.mount(target, undefined, state, ctx);

                return () => module.unmount(target);
            }, []);

            return null;
        }
        const view = render(
            <StrictMode>
                <Host />
            </StrictMode>,
        );

        await act(async () => {
            await Promise.resolve();
        });
        expect(target.textContent).toBe('ready');
        expect(reports).toHaveLength(2);
        expect(reports[0].reportReady).not.toHaveBeenCalled();
        expect(reports[1].reportReady).toHaveBeenCalledTimes(1);
        await act(async () => {
            view.unmount();
        });
        expect(target.textContent).toBe('');
        expect(consoleError).not.toHaveBeenCalled();
    });

    it('передаёт ошибку настоящему mounter-у и однократно освобождает его ресурсы', async () => {
        const error = new Error('module');
        const module = createReactModule({
            Component: () => {
                throw error;
            },
        });
        const release = jest.fn();
        const onError = jest.fn();
        const onReady = jest.fn();
        const moduleResources: ModuleResources = {
            scripts: [],
            styles: [],
            moduleVersion: '1',
            appName: 'test',
            mountMode: 'compat',
            moduleState: state,
        };
        const loader = async () => ({ module, moduleResources, unmount: release });

        function Host() {
            const { targetElementRef, loadingState } = useModuleMounter({
                loader,
                onError,
                onReady,
            });

            return (
                <div>
                    <span data-testid='state'>{loadingState}</span>
                    <div ref={targetElementRef} />
                </div>
            );
        }
        const view = render(<Host />);

        await waitFor(() => expect(onError).toHaveBeenCalledWith({ error, stage: 'runtime' }));
        expect(view.getByTestId('state').textContent).toBe('rejected');
        expect(onReady).not.toHaveBeenCalled();
        view.unmount();
        await act(async () => {
            await Promise.resolve();
        });
        expect(release).toHaveBeenCalledTimes(1);
        expect(
            consoleError.mock.calls.some(([message]) =>
                String(message).includes('synchronously unmount'),
            ),
        ).toBe(false);
    });
});
