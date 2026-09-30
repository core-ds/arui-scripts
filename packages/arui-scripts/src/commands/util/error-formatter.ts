import { type Stats, type StatsError } from '@rspack/core';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';

import { getErrorCategory, getErrorTitle } from './error-category';
import { extractErrorMessage, extractLocation } from './error-location';
import { DOCS_BASE_URL, findErrorPattern, type WebpackErrorLike } from './error-patterns';
import {
    type BuildErrorContext,
    type ErrorLocation as ErrorLocationType,
    type ErrorSuggestion,
    type FormattedError,
} from './error-types';

export const DEFAULT_ERRORS_LIMIT = 5;
export const DEFAULT_SUGGESTIONS_LIMIT = 2;
export const DEFAULT_WARNINGS_LIMIT = 3;

export function formatLocation(location: ErrorLocationType) {
    if (!location.file) {
        return '';
    }

    if (location.line) {
        return location.column
            ? `${location.file}:${location.line}:${location.column}`
            : `${location.file}:${location.line}`;
    }

    return location.file;
}

export function isDeprecationWarning(text: string | undefined) {
    if (!text) {
        return false;
    }

    return (
        text.includes('deprecated') ||
        text.includes('DeprecationWarning') ||
        text.includes('has been deprecated')
    );
}

export function isNodeWarning(text: string | undefined) {
    if (!text) {
        return false;
    }

    return (
        text.includes('node:') ||
        text.includes('Node.js') ||
        text.includes('Consider adding a "types"')
    );
}

function printSuggestion(
    suggestion: ErrorSuggestion,
    print: (text: string) => void,
    indent = '      ',
) {
    print(`${indent}- ${suggestion.message}`);

    if (suggestion.command) {
        print(chalk.gray(`${indent}  Run: ${suggestion.command}`));
    }
}

function toWebpackErrorLike(error: Error | WebpackErrorLike | unknown): WebpackErrorLike {
    if (error instanceof Error) {
        const errorWithMeta = error as Error & Partial<WebpackErrorLike>;

        return {
            message: error.message,
            stack: error.stack,
            loc: errorWithMeta.loc,
            moduleName: errorWithMeta.moduleName,
            file: errorWithMeta.file,
        };
    }

    if (error && typeof error === 'object' && 'message' in error) {
        const errorLike = error as WebpackErrorLike;

        return {
            message: String(errorLike.message ?? ''),
            stack: errorLike.stack,
            loc: errorLike.loc,
            moduleName: errorLike.moduleName,
            file: errorLike.file,
        };
    }

    return { message: String(error) };
}

export function statsErrorToWebpackErrorLike(errorItem: StatsError): WebpackErrorLike {
    const nestedError = (errorItem as StatsError & { error?: Error }).error;

    return {
        message: errorItem.message || nestedError?.message || 'Unknown error',
        stack: errorItem.stack || nestedError?.stack,
        moduleName: errorItem.moduleName,
        file: errorItem.file,
        loc: errorItem.loc,
    };
}

export function handleCompilationResult(
    stats: Stats,
    name: string,
    options?: {
        stats?: Parameters<Stats['toJson']>[0];
        maxErrors?: number;
        maxSuggestions?: number;
        maxWarnings?: number;
        filterWarnings?: (text: string | undefined) => boolean;
    },
) {
    const {
        maxErrors = DEFAULT_ERRORS_LIMIT,
        maxSuggestions = DEFAULT_SUGGESTIONS_LIMIT,
        maxWarnings = DEFAULT_WARNINGS_LIMIT,
        filterWarnings = (text: string | undefined) =>
            isDeprecationWarning(text) || isNodeWarning(text),
    } = options || {};

    if (options?.stats === false) return;
    const statsConfig =
        options?.stats === undefined
            ? { errors: true, warnings: true, colors: undefined }
            : stats.compilation.createStatsOptions(options.stats, { forToString: true });

    if (statsConfig.errors === false && statsConfig.warnings === false) return;
    const log = (text: string) =>
        console.log(statsConfig.colors === false ? stripAnsi(text) : text);
    const hasHiddenDiagnostics = () =>
        (statsConfig.errors === false && stats.hasErrors()) ||
        (statsConfig.warnings === false && stats.hasWarnings());
    const statsJson = stats.toJson(statsConfig);

    const errors = statsJson.errors || [];
    const warnings = statsJson.warnings || [];

    if (errors.length > 0) {
        log(chalk.red(`\n${name}: Build failed\n`));

        const formattedErrors = errors.map((errorItem) =>
            formatError(statsErrorToWebpackErrorLike(errorItem)),
        );
        const grouped = groupErrorsByTitle(formattedErrors);

        for (const [title, titleErrors] of Object.entries(grouped)) {
            log(chalk.bold.red(`${title}:`));

            const displayErrors = titleErrors.slice(0, maxErrors);

            displayErrors.forEach((errorItem) => {
                const [firstLine, ...details] = getMessageLines(errorItem);

                log(`  • ${firstLine.trim()}`);
                details.forEach((line) => log(`    ${line}`));

                if (errorItem.location?.file) {
                    const locationStr = formatLocation(errorItem.location);

                    log(chalk.cyan(`    at ${locationStr}`));
                }
                if (errorItem.suggestions.length > 0) {
                    log(chalk.gray('    Suggestions:'));
                    errorItem.suggestions.slice(0, maxSuggestions).forEach((suggestion) => {
                        printSuggestion(suggestion, log);
                    });
                }
            });

            if (titleErrors.length > maxErrors) {
                const remaining = titleErrors.length - maxErrors;

                log(chalk.gray(`    ... and ${remaining} more`));
            }

            log('\n');
        }

        log(chalk.gray(`Please report issues: ${DOCS_BASE_URL}\n`));

        return;
    }

    if (warnings.length > 0) {
        // В stats.toJson() у предупреждений текст лежит в message (поля text у StatsError нет)
        const importantWarnings = warnings.filter((warning) => !filterWarnings(warning.message));
        const displayWarnings = importantWarnings.slice(0, maxWarnings);

        if (importantWarnings.length > 0) {
            log(chalk.yellow(`${name}: ${importantWarnings.length} warning(s)`));

            displayWarnings.forEach((warning) => {
                log(chalk.yellow(`  ${warning.message}`));
                const location = extractLocation(statsErrorToWebpackErrorLike(warning));

                if (location?.file) {
                    log(chalk.cyan(`    at ${formatLocation(location)}`));
                }
            });

            if (importantWarnings.length > maxWarnings) {
                const remaining = importantWarnings.length - maxWarnings;

                log(chalk.gray(`  ... and ${remaining} more`));
            }

            log('\n');
        } else if (!hasHiddenDiagnostics()) {
            log(chalk.green(`${name}: Build successful`));
        }

        return;
    }

    if (!hasHiddenDiagnostics()) log(chalk.green(`${name}: Build successful`));
}

export function formatError(
    error: Error | WebpackErrorLike | unknown,
    context?: BuildErrorContext,
): FormattedError {
    const original = toWebpackErrorLike(error);
    const errorLike = { ...original, message: stripAnsi(original.message) };

    const category = getErrorCategory(errorLike);
    const title = getErrorTitle(errorLike, category);
    const location = extractLocation(errorLike);

    const matched = findErrorPattern(errorLike);
    const categorySuggestions = matched?.getSuggestions(errorLike) || [];

    const contextSuggestions: ErrorSuggestion[] = [];

    if (context?.moduleName) {
        contextSuggestions.push({
            type: 'general',
            message: `Module: ${context.moduleName}`,
        });
    }

    const suggestions = [...categorySuggestions, ...contextSuggestions];

    return {
        category,
        severity: 'error',
        title,
        message: extractErrorMessage(errorLike),
        location: location
            ? {
                  file: context?.modulePath || location.file || 'unknown',
                  line: location.line || context?.line,
                  column: location.column || context?.column,
              }
            : undefined,
        suggestions,
        originalError: error instanceof Error ? error : new Error(original.message),
    };
}

// Группировка по человекочитаемому заголовку (title), а не по служебному category
export function groupErrorsByTitle(errors: FormattedError[]): Record<string, FormattedError[]> {
    return errors.reduce((acc, error) => {
        const key = error.title;

        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(error);

        return acc;
    }, {} as Record<string, FormattedError[]>);
}

function getMessageLines(error: FormattedError): string[] {
    return String(error.originalError.message || error.message || '')
        .trimEnd()
        .split('\n');
}

export function formatErrorForTerminal(
    error: FormattedError,
    options?: { maxSuggestions?: number; colorize?: boolean },
) {
    const { maxSuggestions = 3, colorize = true } = options || {};
    const lines: string[] = [];
    const visibleSuggestions = error.suggestions.slice(0, maxSuggestions);
    const messageLines = getMessageLines(error);

    const gray = (text: string) => (colorize ? chalk.gray(text) : text);

    lines.push(colorize ? chalk.red(error.title) : error.title);
    messageLines.forEach((messageLine) => {
        lines.push(gray(`  ${messageLine}`));
    });

    if (error.location?.file) {
        const locationStr = `  at ${formatLocation(error.location)}`;

        lines.push(colorize ? chalk.cyan(locationStr) : locationStr);
    }

    if (visibleSuggestions.length > 0) {
        lines.push(gray('\n  Suggestions:'));
        visibleSuggestions.forEach((suggestion) => {
            lines.push(`    • ${suggestion.message}`);
            if (suggestion.command) {
                lines.push(gray(`      Run: ${suggestion.command}`));
            }
        });
    }

    return lines.join('\n');
}
