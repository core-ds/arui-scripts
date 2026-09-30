import { type WebpackErrorLike } from './error-patterns';
import { type ErrorLocation } from './error-types';

function isInternalStackFile(file: string) {
    return file.includes('node_modules') || file.startsWith('node:') || file.includes('internal/');
}

// Разбирает webpack loc: "5:10-6:2" | "5:10-25" | "5:10" | "5-10" | "5".
// До "-" — стартовая позиция "line[:column]"; форма "5-10" — диапазон строк без колонок
function parseLoc(loc: string | undefined): { line?: number; column?: number } {
    if (!loc) {
        return {};
    }

    const [start] = loc.split('-');
    const [lineStr, columnStr] = start.split(':');
    const line = parseInt(lineStr, 10);
    const column = parseInt(columnStr ?? '', 10);

    return {
        line: Number.isNaN(line) ? undefined : line,
        column: Number.isNaN(column) ? undefined : column,
    };
}

export function extractLocation(error: WebpackErrorLike): ErrorLocation | null {
    const stack = error.stack || '';
    const message = error.message || '';

    // 1. Поля stats/bundler (moduleName/file + loc)
    if (error.moduleName || error.file) {
        const { line, column } = parseLoc(error.loc);

        return {
            file: error.moduleName || error.file,
            line,
            column,
        };
    }

    // 2. Путь из сообщения: "file.js:10:5" или "file.js:10"
    const webpackLocationMatch = message.match(/^(.+?):(\d+)(?::(\d+))?/m);

    if (webpackLocationMatch) {
        return {
            file: webpackLocationMatch[1],
            line: parseInt(webpackLocationMatch[2], 10),
            column: webpackLocationMatch[3] ? parseInt(webpackLocationMatch[3], 10) : undefined,
        };
    }

    // 3. Stack — предпочитаем user-файлы, не node_modules / node:internal
    const stackMatches = [...stack.matchAll(/\(([^:]+):(\d+):(\d+)\)/g)];
    const preferredMatch =
        stackMatches.find((match) => !isInternalStackFile(match[1])) || stackMatches[0];

    if (preferredMatch) {
        return {
            file: preferredMatch[1],
            line: parseInt(preferredMatch[2], 10),
            column: parseInt(preferredMatch[3], 10),
        };
    }

    // 4. loc без file — последний шанс
    if (error.loc) {
        const { line, column } = parseLoc(error.loc);

        return {
            file: undefined,
            line,
            column,
        };
    }

    return null;
}

export function extractErrorMessage(error: WebpackErrorLike): string {
    const lines = error.message.split('\n');
    const firstLine = lines[0].trim();
    const mainMessage = firstLine.replace(/^(Error:|Module Error:)\s*/i, '');

    return mainMessage.trim();
}
