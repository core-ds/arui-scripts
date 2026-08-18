/**
 * Ровно та часть API расширений, которой мы пользуемся.
 *
 * Объявлена руками, а не взята из `@types/chrome`: у пакета ноль зависимостей, а нужны нам
 * три метода. Всё опционально - код обязан пережить запуск вне расширения (например, в тестах
 * или если Chrome однажды переименует API).
 */

export type EvalExceptionInfo = {
    isError?: boolean;
    isException?: boolean;
    code?: string;
    description?: string;
    value?: string;
};

/** правило подмены: с какого адреса и куда */
export type OverrideRule = {
    /** origin провайдера, как он записан в диагностике */
    from: string;
    /** куда перенаправлять, обычно локальный дев-сервер */
    to: string;
};

export type DeclarativeNetRequestRule = {
    id: number;
    priority: number;
    action: {
        type: 'redirect';
        redirect: { transform: { scheme?: string; host?: string; port?: string } };
    };
    condition: { urlFilter: string; resourceTypes: string[] };
};

/** документ панели глазами страницы devtools: мост видимости и больше ничего */
export type PanelWindow = {
    __ARUI_DEVTOOLS_PANEL__?: { setVisible(visible: boolean): void };
};

/**
 * Вкладка DevTools, какой её отдаёт `panels.create`.
 *
 * `onShown` приносит `window` документа панели - другого способа до него дотянуться нет.
 * `onHidden` приходит пустым, поэтому окно запоминаем с первого показа.
 */
export type ExtensionPanel = {
    onShown?: { addListener(listener: (panelWindow: PanelWindow) => void): void };
    onHidden?: { addListener(listener: () => void): void };
};

export type ChromeApi = {
    /** просим доступ к origin только когда подмену включают: до этого он не нужен */
    permissions?: {
        contains(permissions: { origins?: string[] }, callback: (granted: boolean) => void): void;
        request(permissions: { origins?: string[] }, callback: (granted: boolean) => void): void;
        remove?(permissions: { origins?: string[] }, callback: (removed: boolean) => void): void;
    };
    declarativeNetRequest?: {
        updateSessionRules(
            options: { addRules?: DeclarativeNetRequestRule[]; removeRuleIds?: number[] },
            callback?: () => void,
        ): void;
        getSessionRules(callback: (rules: DeclarativeNetRequestRule[]) => void): void;
    };
    runtime?: {
        lastError?: { message?: string };
    };
    devtools?: {
        inspectedWindow?: {
            eval(
                expression: string,
                callback: (result: unknown, exceptionInfo?: EvalExceptionInfo) => void,
            ): void;
        };
        network?: {
            onNavigated?: {
                addListener(listener: () => void): void;
                removeListener(listener: () => void): void;
            };
        };
        panels?: {
            create(
                title: string,
                iconPath: string,
                pagePath: string,
                callback?: (panel: ExtensionPanel) => void,
            ): void;
            /** открывает файл во вкладке Sources; строки считаются с нуля */
            openResource?(url: string, lineNumber: number, callback?: () => void): void;
        };
    };
};

type GlobalWithChrome = typeof globalThis & { chrome?: ChromeApi };

/** API расширений, если код выполняется внутри расширения */
export function getChromeApi(): ChromeApi | undefined {
    try {
        return (globalThis as GlobalWithChrome).chrome;
    } catch {
        return undefined;
    }
}
