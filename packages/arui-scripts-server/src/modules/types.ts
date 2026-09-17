import {
    type GetModuleStateResult,
    type GetResourcesRequest,
    type MountMode,
} from '@alfalab/scripts-modules';

/**
 * Параметры серверного рендера модуля.
 */
export type RenderModuleToHtmlParams<GetResourcesParams = void> = {
    /** готовое состояние модуля (результат getModuleState + hostAppId) */
    moduleState: GetModuleStateResult & { hostAppId: string };
    /** сериализуемое подмножество runParams, с которым нужно отрендерить HTML */
    ssrRunParams: unknown;
    /** исходный запрос ресурсов модуля */
    getResourcesRequest: GetResourcesRequest<GetResourcesParams>;
};

export type ModuleDescriptor<FrameworkParams extends unknown[] = [], GetResourcesParams = void> = {
    mountMode: MountMode;
    version?: string;
    getModuleState: (
        getResourcesRequest: GetResourcesRequest<GetResourcesParams>,
        ...params: FrameworkParams
    ) => Promise<GetModuleStateResult>;
    /**
     * Опциональный серверный рендер модуля. Если задан и хост запросил ssr,
     * результат попадёт в поле `html` ответа.
     * Вызывается ПОСЛЕ getModuleState, получает готовый moduleState.
     */
    renderToHtml?: (
        params: RenderModuleToHtmlParams<GetResourcesParams>,
        ...frameworkParams: FrameworkParams
    ) => string | Promise<string>;
};

/**
 * Как обрабатывать ошибки серверного рендера модуля.
 * - `fallback` (по умолчанию) — залогировать ошибку, вернуть ответ без `html`,
 *   клиент выполнит обычный клиентский mount.
 * - `reject` — пробросить ошибку, запрос завершится неуспешно.
 */
export type SsrErrorMode = 'fallback' | 'reject';

export type CreateGetModulesMethodOptions = {
    /** поведение при ошибке `renderToHtml`. По умолчанию `fallback`. */
    ssrErrorMode?: SsrErrorMode;
};

export type ModulesConfig<FrameworkParams extends unknown[] = [], GetResourcesParams = void> = {
    [moduleId: string]: ModuleDescriptor<FrameworkParams, GetResourcesParams>;
};
