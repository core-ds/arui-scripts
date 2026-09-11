import { ERROR_PATTERNS, type WebpackErrorLike } from './error-patterns';
import { type ErrorCategory } from './error-types';

const CATEGORY_BY_KEYWORD: Record<string, ErrorCategory> = {
    typeerror: 'runtime',
    referenceerror: 'runtime',
    configuration: 'configuration',
    syntax: 'syntax',
    css: 'css',
    style: 'css',
};

const TITLE_BY_CATEGORY: Record<ErrorCategory, string> = {
    typescript: 'TypeScript Error',
    module: 'Module Error',
    css: 'CSS Error',
    syntax: 'Syntax Error',
    'module-federation': 'Module Federation Error',
    configuration: 'Configuration Error',
    runtime: 'Runtime Error',
    unknown: 'Build Error',
};

export function getErrorCategory(error: WebpackErrorLike): ErrorCategory {
    for (const { pattern, category } of ERROR_PATTERNS) {
        if (pattern.test(error.message)) {
            return category;
        }
    }

    const message = error.message.toLowerCase();

    for (const [keyword, category] of Object.entries(CATEGORY_BY_KEYWORD)) {
        if (message.includes(keyword)) {
            return category;
        }
    }

    return 'unknown';
}

export function getErrorTitle(_error: WebpackErrorLike, category: ErrorCategory): string {
    return TITLE_BY_CATEGORY[category] ?? 'Build Error';
}
