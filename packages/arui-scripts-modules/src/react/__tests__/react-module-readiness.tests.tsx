import React, { Suspense, useEffect } from 'react';
import { act } from '@testing-library/react';

import { createReactModule, useModuleReady } from '..';

const state = { baseUrl: '/', hostAppId: 'host' };

describe('Готовность React-модуля', () => {
    let target: HTMLDivElement;
    let cleanup: (() => void) | undefined;

    beforeEach(() => {
        target = document.createElement('div');
        document.body.appendChild(target);
    });

    afterEach(async () => {
        await act(async () => {
            cleanup?.();
        });
        target.remove();
        cleanup = undefined;
    });

    it.each(['auto', 'explicit'] as const)(
        'учитывает Suspense fallback в режиме %s',
        async (readiness) => {
            let resolve!: () => void;
            let resolved = false;
            const pending = new Promise<void>((finish) => {
                resolve = () => {
                    resolved = true;
                    finish();
                };
            });

            function Content() {
                useModuleReady();
                if (!resolved) {
                    // Suspense ожидает Promise, а не объект ошибки.
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw pending;
                }

                return <span>content</span>;
            }
            const module = createReactModule({
                Component: () => (
                    <Suspense fallback={<span>loading</span>}>
                        <Content />
                    </Suspense>
                ),
                readiness,
            });
            const ctx = {
                signal: new AbortController().signal,
                reportReady: jest.fn(),
                reportError: jest.fn(),
            };

            cleanup = () => module.unmount(target);
            await act(async () => {
                module.mount(target, undefined, state, ctx);
            });
            expect(target.textContent).toBe('loading');
            expect(ctx.reportReady).toHaveBeenCalledTimes(readiness === 'auto' ? 1 : 0);
            await act(async () => {
                resolve();
            });
            expect(target.textContent).toBe('content');
            expect(ctx.reportReady).toHaveBeenCalledTimes(1);
        },
    );

    it('игнорирует готовность после отмены сигнала хоста', async () => {
        const abortController = new AbortController();

        function App() {
            useModuleReady();
            useEffect(() => {
                abortController.abort();
            }, []);

            return <span>ready</span>;
        }
        const module = createReactModule({ Component: App, readiness: 'explicit' });
        const ctx = {
            signal: abortController.signal,
            reportReady: jest.fn(),
            reportError: jest.fn(),
        };

        cleanup = () => module.unmount(target);
        await act(async () => {
            module.mount(target, undefined, state, ctx);
        });
        expect(ctx.reportReady).not.toHaveBeenCalled();
    });

    it('объединяет повторные сигналы нескольких компонентов в одно уведомление', async () => {
        function Ready() {
            useModuleReady();

            return null;
        }
        const module = createReactModule({
            Component: () => (
                <React.Fragment>
                    <Ready />
                    <Ready />
                </React.Fragment>
            ),
            readiness: 'explicit',
        });
        const ctx = {
            signal: new AbortController().signal,
            reportReady: jest.fn(),
            reportError: jest.fn(),
        };

        cleanup = () => module.unmount(target);
        await act(async () => {
            module.mount(target, undefined, state, ctx);
        });
        expect(ctx.reportReady).toHaveBeenCalledTimes(1);
    });
});
