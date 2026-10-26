import { createModuleLifecycle } from '../module-lifecycle';
import { type ModuleLifecycleContext, type MountableModule } from '../module-types';

const state = { baseUrl: '/', hostAppId: 'host' };

function setup(module: MountableModule<string>, readyTimeoutMs?: number) {
    const onReady = jest.fn();
    const onError = jest.fn();
    const releaseResources = jest.fn();
    const targetNode = document.createElement('div');
    const lifecycle = createModuleLifecycle({
        module,
        targetNode,
        serverState: state,
        releaseResources,
        getOptions: () => ({ onReady, onError, readyTimeoutMs }),
    });

    return { lifecycle, onReady, onError, releaseResources, targetNode };
}

const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

describe('Контекст жизненного цикла модуля', () => {
    afterEach(() => jest.useRealTimers());

    it('сохраняет опциональность контекста при запуске модуля старым хостом', () => {
        const module: MountableModule<string> = {
            mount: (_target, _params, _state, context) => {
                context?.reportReady();
            },
            unmount() {},
        };

        expect(() => module.mount(document.createElement('div'), 'a', state)).not.toThrow();
    });

    it('очищает частично смонтированный модуль и сообщает исходную синхронную ошибку', () => {
        const error = new Error('partial mount');
        const module: MountableModule<string> = {
            mount() {
                throw error;
            },
            unmount: jest.fn(),
        };
        const { lifecycle, onReady, onError, releaseResources } = setup(module);

        lifecycle.mount('a');
        lifecycle.dispose();
        expect(onError).toHaveBeenCalledWith({ error, stage: 'mount' });
        expect(onReady).not.toHaveBeenCalled();
        expect(module.unmount).toHaveBeenCalledTimes(1);
        expect(releaseResources).toHaveBeenCalledTimes(1);
    });

    it('сообщает об асинхронной ошибке гидрации с этапом hydrate', async () => {
        const error = new Error('hydrate');
        const module: MountableModule<string> = {
            mount: jest.fn(),
            hydrate: () => Promise.reject(error),
            unmount: jest.fn(),
        };
        const { lifecycle, onError } = setup(module);

        lifecycle.mount('a', true);
        await flush();
        expect(onError).toHaveBeenCalledWith({ error, stage: 'hydrate' });
        expect(module.mount).not.toHaveBeenCalled();
    });

    it('игнорирует готовность при завершении асинхронного монтирования после очистки', async () => {
        let finish!: () => void;
        const module: MountableModule<string> = {
            mount: () =>
                new Promise<void>((resolve) => {
                    finish = resolve;
                }),
            unmount: jest.fn(),
        };
        const { lifecycle, onReady } = setup(module);

        lifecycle.mount('a');
        lifecycle.dispose();
        finish();
        await flush();
        expect(onReady).not.toHaveBeenCalled();
        expect(module.unmount).toHaveBeenCalledTimes(1);
    });

    it('поддерживает старые методы и сохраняет их контекст this', async () => {
        const module: MountableModule<string> = {
            mount() {
                expect(this).toBe(module);
            },
            unmount: jest.fn(),
        };
        const { lifecycle, onReady } = setup(module);

        lifecycle.mount('a');
        await flush();
        expect(onReady).toHaveBeenCalledTimes(1);
    });

    it('ожидает явной готовности и игнорирует повторные и запоздалые сигналы', async () => {
        let context!: ModuleLifecycleContext;
        const module: MountableModule<string> = {
            readiness: 'explicit',
            mount: (_t, _p, _s, ctx) => {
                context = ctx!;
            },
            unmount: jest.fn(),
        };
        const { lifecycle, onReady, onError, releaseResources } = setup(module);

        lifecycle.mount('a');
        await flush();
        expect(onReady).not.toHaveBeenCalled();
        context.reportReady();
        context.reportReady();
        expect(onReady).toHaveBeenCalledTimes(1);
        lifecycle.dispose();
        context.reportError(new Error('late'));
        context.reportReady();
        lifecycle.dispose();
        expect(context.signal.aborted).toBe(true);
        expect(onError).not.toHaveBeenCalled();
        expect(module.unmount).toHaveBeenCalledTimes(1);
        expect(releaseResources).toHaveBeenCalledTimes(1);
    });

    it('отменяет ранний сигнал готовности при последующей ошибке mount', async () => {
        const error = new Error('mount');
        const module: MountableModule<string> = {
            readiness: 'explicit',
            mount: (_t, _p, _s, ctx) => {
                ctx?.reportReady();

                return Promise.reject(error);
            },
            unmount: jest.fn(),
        };
        const { lifecycle, onReady, onError } = setup(module);

        lifecycle.mount('a');
        await flush();
        expect(onReady).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith({ error, stage: 'mount' });
    });

    it('выполняет обновления последовательно после асинхронного монтирования и сообщает ошибку', async () => {
        let finish!: () => void;
        const error = new Error('update');
        const module: MountableModule<string> = {
            mount: () =>
                new Promise<void>((resolve) => {
                    finish = resolve;
                }),
            update: jest.fn().mockRejectedValue(error),
            unmount: jest.fn(),
        };
        const { lifecycle, onError, releaseResources } = setup(module);

        lifecycle.mount('a');
        lifecycle.update('b');
        lifecycle.update('c');
        expect(module.update).not.toHaveBeenCalled();
        finish();
        await flush();
        await flush();
        expect(module.update).toHaveBeenCalledTimes(1);
        expect(module.update).toHaveBeenCalledWith(
            expect.any(HTMLElement),
            'c',
            state,
            expect.any(Object),
        );
        expect(onError).toHaveBeenCalledWith({ error, stage: 'update' });
        expect(releaseResources).toHaveBeenCalledTimes(1);
    });

    it('сохраняет исходную ошибку при ошибке очистки и останавливает дальнейшие обновления', async () => {
        let context!: ModuleLifecycleContext;
        const error = new Error('runtime');
        const cleanupError = new Error('cleanup');
        const module: MountableModule<string> = {
            mount: (_t, _p, _s, ctx) => {
                context = ctx!;
            },
            update: jest.fn(),
            unmount: jest.fn(() => {
                throw cleanupError;
            }),
        };
        const { lifecycle, onError, releaseResources } = setup(module);

        lifecycle.mount('a');
        await flush();
        context.reportError(error);
        lifecycle.update('b');
        lifecycle.dispose();
        expect(onError.mock.calls.map(([event]) => event)).toEqual([
            { error, stage: 'runtime' },
            { error: cleanupError, stage: 'unmount' },
        ]);
        expect(module.update).not.toHaveBeenCalled();
        expect(module.unmount).toHaveBeenCalledTimes(1);
        expect(releaseResources).toHaveBeenCalledTimes(1);
    });

    it('применяет таймаут только к явной готовности и отменяет таймер после её подтверждения', async () => {
        jest.useFakeTimers();
        const explicit = setup({ readiness: 'explicit', mount() {}, unmount: jest.fn() }, 10);
        const legacy = setup({ mount() {}, unmount: jest.fn() }, 10);

        explicit.lifecycle.mount('a');
        legacy.lifecycle.mount('a');
        await flush();
        jest.advanceTimersByTime(10);
        expect(explicit.onError).toHaveBeenCalledWith({
            error: expect.any(Error),
            stage: 'ready-timeout',
        });
        expect(legacy.onError).not.toHaveBeenCalled();
        let context!: ModuleLifecycleContext;
        const ready = setup(
            {
                readiness: 'explicit',
                mount: (_t, _p, _s, ctx) => {
                    context = ctx!;
                },
                unmount() {},
            },
            10,
        );

        ready.lifecycle.mount('a');
        await flush();
        context.reportReady();
        jest.advanceTimersByTime(20);
        expect(ready.onError).not.toHaveBeenCalled();
    });

    it('изолирует экземпляры с общим экспортом модуля', async () => {
        const contexts: ModuleLifecycleContext[] = [];
        const module: MountableModule<string> = {
            readiness: 'explicit',
            mount: (_t, _p, _s, ctx) => {
                contexts.push(ctx!);
            },
            unmount() {},
        };
        const originalMount = module.mount;
        const a = setup(module);
        const b = setup(module);

        a.lifecycle.mount('a');
        b.lifecycle.mount('b');
        await flush();
        contexts[0].reportReady();
        expect(a.onReady).toHaveBeenCalledTimes(1);
        expect(b.onReady).not.toHaveBeenCalled();
        expect(module.mount).toBe(originalMount);
        a.lifecycle.dispose();
        expect(contexts[1].signal.aborted).toBe(false);
        b.lifecycle.dispose();
    });
});
