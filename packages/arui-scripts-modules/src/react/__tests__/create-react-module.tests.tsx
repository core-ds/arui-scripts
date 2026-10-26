import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { act, fireEvent, render } from '@testing-library/react';

import { type ModuleLifecycleContext } from '../../module-loader/module-types';
import { createReactModule, type ReactModuleProps, useModuleReady } from '..';

const state = { baseUrl: '/', hostAppId: 'host' };
const contexts = () => ({
    signal: new AbortController().signal,
    reportReady: jest.fn(),
    reportError: jest.fn(),
});

describe('React-хелпер модуля', () => {
    let target: HTMLDivElement;
    let cleanups: Array<() => void>;

    beforeEach(() => {
        target = document.createElement('div');
        document.body.appendChild(target);
        cleanups = [];
    });

    afterEach(async () => {
        await act(async () => {
            cleanups.forEach((cleanup) => cleanup());
        });
        target.remove();
    });

    it('сообщает автоматическую готовность после commit и сохраняет состояние при update', async () => {
        function App({ runParams, serverState }: ReactModuleProps<{ label: string }>) {
            const [count, setCount] = useState(0);

            return (
                <button type='button' onClick={() => setCount(count + 1)}>
                    {runParams.label}:{count}:{serverState.hostAppId}
                </button>
            );
        }
        const module = createReactModule({ Component: App });
        const context = contexts();

        cleanups.push(() => module.unmount(target));

        expect(module.readiness).toBe('explicit');
        await act(async () => {
            module.mount(target, { label: 'a' }, state, context);
            expect(context.reportReady).not.toHaveBeenCalled();
        });
        expect(target.textContent).toBe('a:0:host');
        expect(context.reportReady).toHaveBeenCalledTimes(1);
        fireEvent.click(target.querySelector('button')!);
        await act(async () => {
            module.update!(target, { label: 'b' }, state, context);
        });
        expect(target.textContent).toBe('b:1:host');
        expect(context.reportReady).toHaveBeenCalledTimes(1);
    });

    it('ожидает истинного условия в явном режиме и сообщает готовность один раз', async () => {
        function App({ runParams }: ReactModuleProps<boolean>) {
            useModuleReady(runParams);

            return <span>{String(runParams)}</span>;
        }
        const module = createReactModule({ Component: App, readiness: 'explicit' });
        const context = contexts();

        cleanups.push(() => module.unmount(target));
        await act(async () => {
            module.mount(target, false, state, context);
        });
        expect(context.reportReady).not.toHaveBeenCalled();
        await act(async () => {
            module.update!(target, true, state, context);
        });
        expect(context.reportReady).toHaveBeenCalledTimes(1);
        await act(async () => {
            module.update!(target, false, state, context);
        });
        await act(async () => {
            module.update!(target, true, state, context);
        });
        expect(context.reportReady).toHaveBeenCalledTimes(1);
    });

    it('гидрирует серверную разметку с сохранением DOM-узла', async () => {
        const module = createReactModule({ Component: () => <span>server</span> });
        const context = contexts();

        target.innerHTML = '<span>server</span>';
        const serverNode = target.firstChild;

        cleanups.push(() => module.unmount(target));
        await act(async () => {
            module.hydrate!(target, undefined, state, context);
        });
        expect(target.firstChild).toBe(serverNode);
        expect(context.reportReady).toHaveBeenCalledTimes(1);
    });

    it('сохраняет идентификаторы useId при гидрации приложения без служебных обёрток на сервере', async () => {
        function App() {
            const id = React.useId();

            return (
                <label htmlFor={id}>
                    Поле
                    <input id={id} />
                </label>
            );
        }
        target.innerHTML = renderToString(<App />);
        const input = target.querySelector('input');
        const serverId = input!.id;
        const module = createReactModule({ Component: App });
        const context = contexts();
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        cleanups.push(() => module.unmount(target));
        try {
            await act(async () => {
                module.hydrate!(target, undefined, state, context);
            });
            expect(target.querySelector('input')).toBe(input);
            expect(target.querySelector('input')!.id).toBe(serverId);
            expect(consoleError).not.toHaveBeenCalled();
        } finally {
            consoleError.mockRestore();
        }
    });

    it('изолирует root, состояние и готовность двух контейнеров', async () => {
        const other = document.createElement('div');

        function App({ runParams }: ReactModuleProps<string>) {
            useModuleReady();

            return <span>{runParams}</span>;
        }
        const module = createReactModule({ Component: App, readiness: 'explicit' });
        const a = contexts();
        const b = contexts();

        // Контейнеры соседние, чтобы очистка одного root не удаляла другой.
        document.body.appendChild(other);
        cleanups.push(() => {
            module.unmount(target);
            module.unmount(other);
            other.remove();
        });
        await act(async () => {
            module.mount(target, 'a', state, a);
            module.mount(other, 'b', state, b);
        });
        await act(async () => {
            module.unmount(target);
            module.unmount(target);
        });
        expect(target.textContent).toBe('');
        expect(other.textContent).toBe('b');
        expect(a.reportReady).toHaveBeenCalledTimes(1);
        expect(b.reportReady).toHaveBeenCalledTimes(1);
    });

    it('перезапускает тот же контейнер до отложенной очистки без сохранения старого состояния', async () => {
        function App({ runParams }: ReactModuleProps<string>) {
            const [initial] = useState(runParams);

            return <span>{initial}</span>;
        }
        const module = createReactModule({ Component: App });
        const a = contexts();
        const b = contexts();

        cleanups.push(() => module.unmount(target));
        await act(async () => {
            module.mount(target, 'a', state, a);
        });
        await act(async () => {
            module.unmount(target);
            module.mount(target, 'b', state, b);
        });
        expect(target.textContent).toBe('b');
        expect(b.reportReady).toHaveBeenCalledTimes(1);
    });

    it('работает без контекста старого хоста и допускает хук вне Provider', async () => {
        function App() {
            useModuleReady();

            return <span>ready</span>;
        }
        const module = createReactModule({ Component: App, readiness: 'explicit' });

        cleanups.push(() => module.unmount(target));
        await act(async () => {
            module.mount(target, undefined, state);
        });
        expect(target.textContent).toBe('ready');
        const view = render(<App />);

        expect(view.container.textContent).toBe('ready');
    });

    it('отклоняет повторное активное монтирование и update до запуска', async () => {
        const module = createReactModule({ Component: () => <span>ready</span> });

        expect(() => module.update!(target, undefined, state)).toThrow();
        cleanups.push(() => module.unmount(target));
        await act(async () => {
            module.mount(target, undefined, state);
        });
        expect(() => module.mount(target, undefined, state)).toThrow();
        expect(() => module.hydrate!(target, undefined, state)).toThrow();
    });

    it('игнорирует отложенную готовность отменённого запуска', async () => {
        let cancel!: () => void;
        const context: ModuleLifecycleContext = {
            ...contexts(),
            reportReady: jest.fn(),
        };

        function App() {
            useModuleReady();
            React.useEffect(() => {
                cancel();
            }, []);

            return <span>ready</span>;
        }
        const module = createReactModule({ Component: App, readiness: 'explicit' });

        cancel = () => module.unmount(target);
        cleanups.push(cancel);
        await act(async () => {
            module.mount(target, undefined, state, context);
        });
        expect(context.reportReady).not.toHaveBeenCalled();
    });
});
