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

export type ChromeApi = {
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
                callback?: (panel: unknown) => void,
            ): void;
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
