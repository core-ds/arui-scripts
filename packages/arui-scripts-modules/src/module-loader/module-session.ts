import { MODULE_SSR_MODULE_ATTRIBUTE } from './utils/get-embedded-module-resources';
import { unwrapDefaultExport } from './utils/unwrap-default-export';
import { createModuleLifecycle, reportModuleError } from './module-lifecycle';
import {
    type ModuleMounterErrorStage,
    type ModuleMounterOptions,
    type MountableModule,
} from './module-types';
import { type BaseModuleState, type LoaderResult } from './types';

type SessionParams<RunParams, ServerState extends BaseModuleState> = {
    load: (
        signal: AbortSignal,
        onLoadError: (stage: ModuleMounterErrorStage) => void,
    ) => Promise<LoaderResult<MountableModule<RunParams, ServerState>>>;
    targetNode: HTMLElement;
    getRunParams: () => RunParams;
    getOptions: () => ModuleMounterOptions;
    hydrate?: boolean;
};

export function resolveMountableModule<RunParams, ServerState extends BaseModuleState>(
    exportedModule: MountableModule<RunParams, ServerState>,
) {
    const module = exportedModule && unwrapDefaultExport(exportedModule);

    if (!module || typeof module.mount !== 'function' || typeof module.unmount !== 'function') {
        throw new Error('Loaded module does not implement mount/unmount');
    }

    return module;
}

export function releaseModuleResources(release: () => void, options: ModuleMounterOptions) {
    try {
        release();
    } catch (error) {
        reportModuleError(options, { error, stage: 'unmount' });
    }
}

/** Одна попытка загрузки и жизненный цикл экземпляра, независимые от общего экспорта модуля. */
export function createModuleSession<RunParams, ServerState extends BaseModuleState>({
    load,
    targetNode,
    getRunParams,
    getOptions,
    hydrate = false,
}: SessionParams<RunParams, ServerState>) {
    const abortController = new AbortController();
    let lifecycle: ReturnType<typeof createModuleLifecycle<RunParams, ServerState>> | undefined;
    let stage: ModuleMounterErrorStage = 'resolve-export';

    async function run() {
        let result: LoaderResult<MountableModule<RunParams, ServerState>> | undefined;

        try {
            result = await load(abortController.signal, (errorStage) => {
                stage = errorStage;
            });
            if (abortController.signal.aborted) {
                releaseModuleResources(result.unmount, getOptions());

                return;
            }
            const module = resolveMountableModule(result.module);

            if (hydrate && !module.hydrate && process.env.NODE_ENV !== 'production') {
                const moduleId = targetNode
                    .closest(`[${MODULE_SSR_MODULE_ATTRIBUTE}]`)
                    ?.getAttribute(MODULE_SSR_MODULE_ATTRIBUTE);

                // eslint-disable-next-line no-console
                console.warn(
                    `SSR module "${moduleId}" does not export hydrate — replacing server markup through mount.`,
                );
            }

            if (hydrate && !module.hydrate) targetNode.replaceChildren();
            lifecycle = createModuleLifecycle({
                module,
                targetNode,
                serverState: result.moduleResources.moduleState as ServerState,
                releaseResources: () => result?.unmount(),
                getOptions,
            });
        } catch (error) {
            if (abortController.signal.aborted) return;
            abortController.abort();
            const cleanupErrors: unknown[] = [];

            try {
                result?.unmount();
            } catch (releaseError) {
                cleanupErrors.push(releaseError);
            }
            reportModuleError(getOptions(), { error, stage });
            cleanupErrors.forEach((releaseError) =>
                reportModuleError(getOptions(), { error: releaseError, stage: 'unmount' }),
            );

            return;
        }
        // Методы жизненного цикла и обработчики потребителя обрабатывают ошибки отдельно.
        lifecycle.mount(getRunParams(), hydrate);
    }

    run();

    return {
        update(params: RunParams) {
            lifecycle?.update(params);
        },
        dispose() {
            lifecycle?.dispose();
            abortController.abort();
        },
    };
}
