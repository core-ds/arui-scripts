import React, { useEffect, useRef } from 'react';

import { createEmbeddedModuleFetcher } from '../module-loader/create-embedded-module-fetcher';
import {
    createModuleLoader,
    type CreateModuleLoaderParams,
    type ModuleResourcesGetter,
} from '../module-loader/create-module-loader';
import { type MountableModule } from '../module-loader/module-types';
import { type BaseModuleState, type Loader } from '../module-loader/types';
import {
    MODULE_SSR_HREF_ATTRIBUTE,
    MODULE_SSR_INSTANCE_ATTRIBUTE,
    MODULE_SSR_MOUNT_ID_ATTRIBUTE,
    MODULE_SSR_PAYLOAD_ATTRIBUTE,
    MODULE_SSR_ROOT_ATTRIBUTE,
} from '../module-loader/utils/get-embedded-module-resources';
import { serializeForHtml } from '../module-loader/utils/serialize-for-html';
import { unwrapDefaultExport } from '../module-loader/utils/unwrap-default-export';

import { getDefaultInstanceId } from './instance-id';
import {
    createDefaultFetchStyleContent,
    type FetchStyleContent,
    loadServerModule,
} from './server-module-loader';
import { readSuspenseResource } from './suspense-resource-cache';

const DATA_APP_ID_ATTRIBUTE = 'data-parent-app-id';

export type CreateSsrMounterOptions<
    RunParams,
    GetResourcesParams,
    ModuleState extends BaseModuleState,
> = {
    /** id загружаемого модуля */
    moduleId: string;
    /** id приложения-хоста */
    hostAppId: string;
    /**
     * Фетчер ресурсов модуля (например, `createServerStateModuleFetcher`). Используется
     * напрямую на сервере (для получения html), а на клиенте оборачивается в
     * `createEmbeddedModuleFetcher`, чтобы не делать повторный сетевой запрос.
     */
    getModuleResources: ModuleResourcesGetter<GetResourcesParams, ModuleState>;
    /** функция скачивания css модуля для инлайна (по умолчанию — глобальный `fetch`) */
    fetchStyleContent?: FetchStyleContent;
} & Omit<
    CreateModuleLoaderParams<
        MountableModule<RunParams, ModuleState>,
        GetResourcesParams,
        ModuleState
    >,
    'moduleId' | 'hostAppId' | 'getModuleResources'
>;

// Пропсы делятся между ServerModule и ClientModule (общий тип), поэтому правило
// no-unused-prop-types даёт ложные срабатывания — отключаем для этого файла.
/* eslint-disable react/no-unused-prop-types */
export type SsrModuleComponentProps<RunParams, SsrRunParams, GetResourcesParams> = {
    /** полные параметры для `mount`/`hydrate`/`update` (могут содержать колбэки, ref-ы) */
    runParams?: RunParams;
    /** сериализуемое подмножество параметров, с которым модуль рендерится на сервере */
    ssrRunParams?: SsrRunParams;
    /** параметры, которые передаются в фетчер ресурсов модуля */
    getResourcesParams?: GetResourcesParams;
    /** id инстанса — нужен, если на странице несколько инстансов одного модуля */
    instanceId?: string;
    /** SSR + shadow DOM не поддерживается — приведёт к ошибке */
    useShadowDom?: boolean;
};

/**
 * Создаёт изоморфный компонент для серверного рендеринга модуля.
 *
 * На сервере компонент подвешивается (Suspense) на запрос ресурсов модуля с флагом `ssr`,
 * инлайнит стили, рендерит html модуля и встраивает payload ресурсов в разметку. На клиенте
 * компонент читает этот payload (без повторного сетевого запроса), гидрирует серверную
 * разметку через `module.hydrate` (или монтирует заново, если `hydrate` нет) и обновляет
 * модуль через `module.update` при изменении `runParams`.
 *
 * Клиентский лоадер строится внутри фабрики: фетчер оборачивается в `createEmbeddedModuleFetcher`
 * с исходным фетчером в качестве fallback, поэтому повторный запрос ресурсов не выполняется.
 */
export function createSsrMounter<
    RunParams = void,
    SsrRunParams = unknown,
    GetResourcesParams = undefined,
    ModuleState extends BaseModuleState = BaseModuleState,
>({
    moduleId,
    hostAppId,
    getModuleResources,
    fetchStyleContent = createDefaultFetchStyleContent(),
    ...loaderOptions
}: CreateSsrMounterOptions<RunParams, GetResourcesParams, ModuleState>) {
    type ModuleType = MountableModule<RunParams, ModuleState>;

    let clientLoader: Loader<GetResourcesParams, ModuleType> | undefined;

    function getClientLoader() {
        if (!clientLoader) {
            clientLoader = createModuleLoader<ModuleType, GetResourcesParams, ModuleState>({
                moduleId,
                hostAppId,
                getModuleResources: createEmbeddedModuleFetcher<GetResourcesParams>({
                    fallback: getModuleResources as ModuleResourcesGetter<GetResourcesParams>,
                }) as ModuleResourcesGetter<GetResourcesParams, ModuleState>,
                ...loaderOptions,
            });
        }

        return clientLoader;
    }

    function ServerModule({
        ssrRunParams,
        getResourcesParams,
        instanceId: instanceIdProp,
    }: SsrModuleComponentProps<RunParams, SsrRunParams, GetResourcesParams>) {
        const instanceId = instanceIdProp ?? getDefaultInstanceId(ssrRunParams);
        const cacheKey = [
            moduleId,
            instanceId,
            safeStringify(getResourcesParams),
            safeStringify(ssrRunParams),
        ].join('::');

        const { resources, inlineStyles } = readSuspenseResource(cacheKey, () =>
            loadServerModule<GetResourcesParams, ModuleState>({
                moduleId,
                hostAppId,
                params: getResourcesParams as GetResourcesParams,
                ssrRunParams,
                getModuleResources,
                fetchStyleContent,
            }),
        );

        const { html, ...payload } = resources;

        return (
            <div {...{ [MODULE_SSR_ROOT_ATTRIBUTE]: instanceId }}>
                {inlineStyles.map((style) => (
                    <style
                        key={style.href}
                        {...{
                            [DATA_APP_ID_ATTRIBUTE]: moduleId,
                            [MODULE_SSR_HREF_ATTRIBUTE]: style.href,
                        }}
                        dangerouslySetInnerHTML={{ __html: style.content }}
                    />
                ))}
                <div
                    {...{ [MODULE_SSR_MOUNT_ID_ATTRIBUTE]: instanceId }}
                    dangerouslySetInnerHTML={{ __html: html ?? '' }}
                />
                <script
                    type='application/json'
                    {...{
                        [MODULE_SSR_PAYLOAD_ATTRIBUTE]: moduleId,
                        [MODULE_SSR_INSTANCE_ATTRIBUTE]: instanceId,
                    }}
                    dangerouslySetInnerHTML={{ __html: serializeForHtml(payload) }}
                />
            </div>
        );
    }

    function ClientModule({
        runParams,
        ssrRunParams,
        getResourcesParams,
        instanceId: instanceIdProp,
        useShadowDom,
    }: SsrModuleComponentProps<RunParams, SsrRunParams, GetResourcesParams>) {
        if (useShadowDom) {
            throw new Error(
                'createSsrMounter: серверный рендеринг модулей в shadow DOM не поддерживается.',
            );
        }

        const instanceId = instanceIdProp ?? getDefaultInstanceId(ssrRunParams);

        const rootRef = useRef<HTMLDivElement>(null);
        const runParamsRef = useRef(runParams);

        runParamsRef.current = runParams;

        // Снапшот серверной разметки снимаем один раз, до того как React что-либо изменит,
        // и рендерим обёртку как «непрозрачный» HTML, чтобы React не тронул стили/payload/outlet.
        const snapshotRef = useRef<string | null>(null);
        const hadServerHtmlRef = useRef(false);

        if (snapshotRef.current === null) {
            const { snapshot, hadServerHtml } = readServerMarkup(instanceId);

            snapshotRef.current = snapshot;
            hadServerHtmlRef.current = hadServerHtml;
        }

        const mountedRef = useRef<{
            module: ModuleType;
            target: HTMLElement;
            serverState: ModuleState;
        } | null>(null);

        useEffect(() => {
            const root = rootRef.current;

            if (!root) {
                return undefined;
            }

            const target = root.querySelector<HTMLElement>(
                `[${MODULE_SSR_MOUNT_ID_ATTRIBUTE}="${cssEscape(instanceId)}"]`,
            );

            if (!target) {
                return undefined;
            }

            const abortController = new AbortController();
            let cleanup: (() => void) | undefined;

            (async () => {
                try {
                    const result = await getClientLoader()({
                        getResourcesParams,
                        abortSignal: abortController.signal,
                    });

                    if (abortController.signal.aborted) {
                        return;
                    }

                    const module = unwrapDefaultExport(result.module);
                    const serverState = result.moduleResources.moduleState as ModuleState;

                    if (hadServerHtmlRef.current && module.hydrate) {
                        module.hydrate(target, runParamsRef.current as RunParams, serverState);
                    } else {
                        if (
                            hadServerHtmlRef.current &&
                            !module.hydrate &&
                            process.env.NODE_ENV !== 'production'
                        ) {
                            // eslint-disable-next-line no-console
                            console.warn(
                                `Модуль "${moduleId}" отрендерен на сервере, но не экспортирует hydrate — ` +
                                    'разметка будет заменена через mount (возможно мигание). Добавьте hydrate для гидрации.',
                            );
                        }

                        target.innerHTML = '';
                        module.mount(target, runParamsRef.current as RunParams, serverState);
                    }

                    mountedRef.current = { module, target, serverState };

                    cleanup = () => {
                        mountedRef.current = null;
                        result.unmount();
                        module.unmount(target);
                    };
                } catch (error) {
                    if (abortController.signal.aborted) {
                        return;
                    }
                    // eslint-disable-next-line no-console
                    console.error(error);
                }
            })();

            return () => {
                cleanup?.();
                abortController.abort();
            };
            // монтируем один раз; обновление параметров — через отдельный эффект ниже
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // При изменении runParams обновляем модуль через `update`, если он есть.
        useEffect(() => {
            const mounted = mountedRef.current;

            if (!mounted?.module.update) {
                return;
            }

            mounted.module.update(mounted.target, runParams as RunParams, mounted.serverState);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [runParams]);

        if (snapshotRef.current) {
            return (
                <div
                    ref={rootRef}
                    {...{ [MODULE_SSR_ROOT_ATTRIBUTE]: instanceId }}
                    dangerouslySetInnerHTML={{ __html: snapshotRef.current }}
                    suppressHydrationWarning={true}
                />
            );
        }

        // Нет серверной разметки (например, клиентский SPA-переход) — рендерим пустой outlet
        // для обычного монтирования.
        return (
            <div ref={rootRef} {...{ [MODULE_SSR_ROOT_ATTRIBUTE]: instanceId }}>
                <div {...{ [MODULE_SSR_MOUNT_ID_ATTRIBUTE]: instanceId }} />
            </div>
        );
    }

    function ModuleComponent(
        props: SsrModuleComponentProps<RunParams, SsrRunParams, GetResourcesParams>,
    ) {
        if (typeof window === 'undefined') {
            return <ServerModule {...props} />;
        }

        return <ClientModule {...props} />;
    }

    return { ModuleComponent };
}

function safeStringify(value: unknown): string {
    try {
        return JSON.stringify(value) ?? 'undefined';
    } catch {
        return 'unknown';
    }
}

function readServerMarkup(instanceId: string): { snapshot: string; hadServerHtml: boolean } {
    if (typeof document === 'undefined') {
        return { snapshot: '', hadServerHtml: false };
    }

    const root = document.querySelector(
        `[${MODULE_SSR_ROOT_ATTRIBUTE}="${cssEscape(instanceId)}"]`,
    );

    if (!root) {
        return { snapshot: '', hadServerHtml: false };
    }

    const outlet = root.querySelector(
        `[${MODULE_SSR_MOUNT_ID_ATTRIBUTE}="${cssEscape(instanceId)}"]`,
    );

    return {
        snapshot: root.innerHTML,
        hadServerHtml: !!outlet && outlet.innerHTML.trim() !== '',
    };
}

function cssEscape(value: string): string {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(value);
    }

    return value.replace(/["\\]/g, '\\$&');
}
