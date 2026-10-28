import React, { createContext, useContext, useEffect } from 'react';

import { type ModuleLifecycleContext } from '../module-loader/module-types';

export function createReactModuleRuntime(
    context: ModuleLifecycleContext | undefined,
    readiness: 'auto' | 'explicit',
) {
    let active = true;
    let failed = false;
    let ready = false;
    let readyScheduled = false;

    function notify(callback: () => void) {
        try {
            callback();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }

    return {
        readiness,
        isActive: () => active,
        deactivate() {
            active = false;
        },
        requestReady() {
            if (!active || failed || ready || readyScheduled || context?.signal.aborted) {
                return;
            }
            readyScheduled = true;
            // Проверяем запуск после эффектов, чтобы ошибка того же commit отменила готовность.
            Promise.resolve().then(() => {
                readyScheduled = false;
                if (!active || failed || ready || context?.signal.aborted) {
                    return;
                }
                ready = true;
                notify(() => context?.reportReady());
            });
        },
        reportError(error: unknown) {
            if (!active || failed || context?.signal.aborted) {
                return;
            }
            failed = true;
            // Обработчик хоста может инициировать cleanup: вызываем его вне commit React.
            Promise.resolve().then(() => {
                if (!active || context?.signal.aborted) {
                    return;
                }
                notify(() => {
                    if (context) {
                        context.reportError(error);
                    } else {
                        // eslint-disable-next-line no-console
                        console.error(error);
                    }
                });
            });
        },
    };
}

type ReactModuleRuntime = ReturnType<typeof createReactModuleRuntime>;
const ModuleContext = createContext<ReactModuleRuntime | undefined>(undefined);

/** Сообщает о готовности после commit, когда условие становится истинным. */
export function useModuleReady(condition = true) {
    const runtime = useContext(ModuleContext);

    useEffect(() => {
        if (condition && runtime?.readiness === 'explicit') {
            runtime.requestReady();
        }
    }, [condition, runtime]);
}

class ModuleErrorBoundary extends React.Component<
    {
        runtime: ReactModuleRuntime;
        children: React.ReactNode;
    },
    { failed: boolean }
> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: unknown) {
        this.props.runtime.reportError(error);
    }

    render() {
        return this.state.failed ? null : this.props.children;
    }
}

export function ModuleRuntimeProvider({
    runtime,
    children,
}: {
    runtime: ReactModuleRuntime;
    children: React.ReactNode;
}) {
    // Не добавляем соседний служебный компонент: он меняет useId при гидрации обычного App.
    useEffect(() => {
        if (runtime.readiness === 'auto') {
            runtime.requestReady();
        }
    }, [runtime]);

    return (
        <ModuleContext.Provider value={runtime}>
            <ModuleErrorBoundary runtime={runtime}>{children}</ModuleErrorBoundary>
        </ModuleContext.Provider>
    );
}
