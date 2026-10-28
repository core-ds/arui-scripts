import {
    type ModuleLifecycleContext,
    type ModuleMounterError,
    type ModuleMounterOptions,
    type MountableModule,
} from './module-types';
import { type BaseModuleState } from './types';

type LifecycleParams<RunParams, ServerState extends BaseModuleState> = {
    module: MountableModule<RunParams, ServerState>;
    targetNode: HTMLElement;
    serverState: ServerState;
    releaseResources: () => void;
    getOptions: () => ModuleMounterOptions;
};

function tryNotifyModuleCallback(callback: (() => void) | undefined) {
    try {
        callback?.();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
    }
}

export function reportModuleError(options: ModuleMounterOptions, event: ModuleMounterError) {
    if (options.onError) {
        tryNotifyModuleCallback(() => options.onError?.(event));
    } else {
        // eslint-disable-next-line no-console
        console.error(event.error);
    }
}

export function createModuleLifecycle<RunParams, ServerState extends BaseModuleState>({
    module,
    targetNode,
    serverState,
    releaseResources,
    getOptions,
}: LifecycleParams<RunParams, ServerState>) {
    const abortController = new AbortController();
    let stopped = false;
    let started = false;
    let initialCompleted = false;
    let readyRequested = false;
    let ready = false;
    let busy = false;
    let pendingUpdate: { params: RunParams } | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const context: ModuleLifecycleContext = {
        signal: abortController.signal,
        reportReady() {
            if (stopped) {
                return;
            }
            readyRequested = true;
            checkReady();
        },
        reportError(error) {
            fail({ error, stage: 'runtime' });
        },
    };

    function stop() {
        stopped = true;
        clearTimeout(timer);
        pendingUpdate = undefined;
        abortController.abort();
    }

    function cleanup() {
        const errors: unknown[] = [];

        try {
            if (started) {
                module.unmount(targetNode, context);
            }
        } catch (error) {
            errors.push(error);
        }
        try {
            releaseResources();
        } catch (error) {
            errors.push(error);
        }

        return errors;
    }

    function reportCleanupErrors(errors: unknown[]) {
        errors.forEach((error) => reportModuleError(getOptions(), { error, stage: 'unmount' }));
    }

    function fail(event: ModuleMounterError) {
        if (stopped) {
            return;
        }
        stop();
        const errors = cleanup();

        reportModuleError(getOptions(), event);
        reportCleanupErrors(errors);
    }

    function checkReady() {
        if (stopped || ready || !initialCompleted) {
            return;
        }
        if (module.readiness === 'explicit' && !readyRequested) {
            return;
        }
        ready = true;
        clearTimeout(timer);
        tryNotifyModuleCallback(getOptions().onReady);
    }

    function invoke(method: 'mount' | 'hydrate' | 'update', params: RunParams) {
        if (stopped) {
            return;
        }
        busy = true;
        let result: void | Promise<void>;

        try {
            result = module[method]?.(targetNode, params, serverState, context);
        } catch (error) {
            fail({ error, stage: method });

            return;
        }
        const complete = () => {
            if (stopped) {
                return;
            }

            busy = false;
            if (method !== 'update') {
                initialCompleted = true;
            }
            // Применяем отложенные параметры до вызова обработчика готовности, который может синхронно размонтировать хост.
            const next = pendingUpdate;

            pendingUpdate = undefined;
            if (next && module.update) {
                invoke('update', next.params);
            }
            checkReady();
        };

        // Сохраняем синхронное выполнение методов жизненного цикла существующих модулей.
        if (result && typeof result.then === 'function') {
            Promise.resolve(result).then(complete, (error) => fail({ error, stage: method }));
        } else {
            complete();
        }
    }

    return {
        mount(params: RunParams, hydrate = false) {
            if (started || stopped) {
                return;
            }
            started = true;
            const timeout = getOptions().readyTimeoutMs;

            if (
                module.readiness === 'explicit' &&
                timeout &&
                Number.isFinite(timeout) &&
                timeout > 0
            ) {
                timer = setTimeout(
                    () =>
                        fail({
                            error: new Error(`Module readiness timed out after ${timeout}ms`),
                            stage: 'ready-timeout',
                        }),
                    timeout,
                );
            }
            invoke(hydrate && module.hydrate ? 'hydrate' : 'mount', params);
        },
        update(params: RunParams) {
            if (stopped || !started || !module.update) {
                return;
            }
            if (busy) {
                pendingUpdate = { params };
            } else {
                invoke('update', params);
            }
        },
        dispose() {
            if (stopped) {
                return;
            }
            stop();
            reportCleanupErrors(cleanup());
        },
    };
}
