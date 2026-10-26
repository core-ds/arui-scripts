import React from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';

import { type ModuleLifecycleContext, type MountableModule } from '../module-loader/module-types';
import { type BaseModuleState } from '../module-loader/types';

import { createReactModuleRuntime, ModuleRuntimeProvider } from './module-runtime';
import { type CreateReactModuleOptions } from './types';

export function createReactModule<
    RunParams = void,
    ServerState extends BaseModuleState = BaseModuleState,
>({
    Component,
    readiness = 'auto',
}: CreateReactModuleOptions<RunParams, ServerState>): MountableModule<RunParams, ServerState> {
    type Runtime = ReturnType<typeof createReactModuleRuntime>;
    type Entry = { root: Root; runtime: Runtime; generation: number };
    const roots = new WeakMap<HTMLElement, Entry>();
    let generation = 0;

    function tree(runParams: RunParams, serverState: ServerState, runtime: Runtime, key: number) {
        return (
            <ModuleRuntimeProvider key={key} runtime={runtime}>
                <Component runParams={runParams} serverState={serverState} />
            </ModuleRuntimeProvider>
        );
    }

    function start(
        target: HTMLElement,
        runParams: RunParams,
        serverState: ServerState,
        context: ModuleLifecycleContext | undefined,
        hydrate: boolean,
    ) {
        const previous = roots.get(target);

        if (previous?.runtime.isActive()) {
            throw new Error('React-модуль уже смонтирован в этом контейнере');
        }
        const runtime = createReactModuleRuntime(context, readiness);

        generation += 1;
        const content = tree(runParams, serverState, runtime, generation);

        if (previous) {
            // Отменяем отложенное уничтожение root, но начинаем новый запуск с новым ключом дерева.
            const entry = { root: previous.root, runtime, generation };

            roots.set(target, entry);
            entry.root.render(content);
        } else if (hydrate) {
            const root = hydrateRoot(target, content);

            roots.set(target, { root, runtime, generation });
        } else {
            const root = createRoot(target);

            roots.set(target, { root, runtime, generation });
            root.render(content);
        }
    }

    return {
        // Даже автоматический режим ждёт React commit, а не возврата из root.render.
        readiness: 'explicit',
        mount(target, runParams, serverState, context) {
            start(target, runParams, serverState, context, false);
        },
        hydrate(target, runParams, serverState, context) {
            start(target, runParams, serverState, context, true);
        },
        update(target, runParams, serverState) {
            const entry = roots.get(target);

            if (!entry?.runtime.isActive()) {
                throw new Error('React-модуль ещё не смонтирован в этом контейнере');
            }
            entry.root.render(tree(runParams, serverState, entry.runtime, entry.generation));
        },
        unmount(target) {
            const entry = roots.get(target);

            if (!entry?.runtime.isActive()) {
                return;
            }
            entry.runtime.deactivate();
            // Хост может вызвать cleanup во время своего commit: освобождаем root после него.
            Promise.resolve().then(() => {
                if (roots.get(target) !== entry) {
                    return;
                }
                roots.delete(target);
                try {
                    entry.root.unmount();
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(error);
                }
            });
        },
    };
}
