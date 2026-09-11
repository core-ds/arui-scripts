import { type Stats, type StatsError } from '@rspack/core';
import chalk from 'chalk';

import { getErrorCategory, getErrorTitle } from './error-category';
import { extractErrorMessage, extractLocation } from './error-location';
import { DOCS_BASE_URL, ERROR_PATTERNS, type WebpackErrorLike } from './error-patterns';
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

function printSuggestion(suggestion: ErrorSuggestion, indent = '      ') {
    console.log(`${indent}- ${suggestion.message}`);

    if (suggestion.command) {
        console.log(chalk.gray(`${indent}  Run: ${suggestion.command}`));
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

    const statsJson = stats.toJson({
        errors: true,
        warnings: true,
    });

    const errors = statsJson.errors || [];
    const warnings = statsJson.warnings || [];

    if (errors.length > 0) {
        console.log(chalk.red(`\n${name}: Build failed\n`));

        const formattedErrors = errors.map((errorItem) =>
            formatError(statsErrorToWebpackErrorLike(errorItem)),
        );
        const grouped = groupErrorsByTitle(formattedErrors);

        for (const [title, titleErrors] of Object.entries(grouped)) {
            console.log(chalk.bold.red(`${title}:`));

            const displayErrors = titleErrors.slice(0, maxErrors);

            displayErrors.forEach((errorItem) => {
                console.log(`  • ${errorItem.message}`);

                if (errorItem.location?.file) {
                    const locationStr = formatLocation(errorItem.location);

                    console.log(chalk.cyan(`    at ${locationStr}`));
                }
                if (errorItem.suggestions.length > 0) {
                    console.log(chalk.gray('    Suggestions:'));
                    errorItem.suggestions.slice(0, maxSuggestions).forEach((suggestion) => {
                        printSuggestion(suggestion);
                    });
                }
            });

            if (titleErrors.length > maxErrors) {
                const remaining = titleErrors.length - maxErrors;

                console.log(chalk.gray(`    ... and ${remaining} more`));
            }

            console.log('\n');
        }

        console.log(chalk.gray(`Please report issues: ${DOCS_BASE_URL}\n`));

        return;
    }

    if (warnings.length > 0) {
        // В stats.toJson() у предупреждений текст лежит в message (поля text у StatsError нет)
        const importantWarnings = warnings.filter((warning) => !filterWarnings(warning.message));
        const displayWarnings = importantWarnings.slice(0, maxWarnings);

        if (displayWarnings.length > 0) {
            console.log(chalk.yellow(`${name}: ${importantWarnings.length} warning(s)`));

            displayWarnings.forEach((warning) => {
                const text =
                    warning.message.length > 100
                        ? `${warning.message.substring(0, 100)}...`
                        : warning.message;

                console.log(chalk.yellow(`  ${text}`));
            });

            if (importantWarnings.length > maxWarnings) {
                const remaining = importantWarnings.length - maxWarnings;

                console.log(chalk.gray(`  ... and ${remaining} more`));
            }

            console.log('\n');
        } else {
            console.log(chalk.green(`${name}: Build successful`));
        }

        return;
    }

    console.log(chalk.green(`${name}: Build successful`));
}

export function formatError(
    error: Error | WebpackErrorLike | unknown,
    context?: BuildErrorContext,
): FormattedError {
    const errorLike = toWebpackErrorLike(error);

    const category = getErrorCategory(errorLike);
    const title = getErrorTitle(errorLike, category);
    const location = extractLocation(errorLike);

    const categorySuggestions: ErrorSuggestion[] = [];

    for (const { pattern, getSuggestions } of ERROR_PATTERNS) {
        if (pattern.test(errorLike.message)) {
            categorySuggestions.push(...getSuggestions(errorLike));
            break;
        }
    }

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
        originalError: error instanceof Error ? error : new Error(errorLike.message),
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

export function createErrorSummary(
    errors: FormattedError[],
    warnings: FormattedError[],
): {
    totalErrors: number;
    totalWarnings: number;
    errorsByCategory: Record<string, FormattedError[]>;
} {
    return {
        totalErrors: errors.length,
        totalWarnings: warnings.length,
        errorsByCategory: {
            ...groupErrorsByTitle(errors),
            Warnings: warnings,
        },
    };
}

export function formatErrorForTerminal(
    error: FormattedError,
    options?: { maxSuggestions?: number; colorize?: boolean },
) {
    const { maxSuggestions = 3, colorize = true } = options || {};
    const lines: string[] = [];
    const visibleSuggestions = error.suggestions.slice(0, maxSuggestions);
    // В подробном одиночном выводе показываем полное сообщение (с деталями и код-фреймом),
    // короткое error.message остаётся для сгруппированных списков
    const fullMessage = String(error.originalError.message || error.message || '');
    const messageLines = fullMessage ? fullMessage.split('\n') : [];

    if (colorize) {
        lines.push(chalk.red(`${error.title}`));

        messageLines.forEach((messageLine) => {
            lines.push(chalk.gray(`  ${messageLine}`));
        });

        if (error.location?.file) {
            const locationStr = formatLocation(error.location);

            lines.push(chalk.cyan(`  at ${locationStr}`));
        }

        if (visibleSuggestions.length > 0) {
            lines.push(chalk.gray('\n  Suggestions:'));

            visibleSuggestions.forEach((suggestion) => {
                if (suggestion.command) {
                    lines.push(`    • ${suggestion.message}`);
                    lines.push(chalk.gray(`      Run: ${suggestion.command}`));
                } else {
                    lines.push(`    • ${suggestion.message}`);
                }
            });
        }
    } else {
        lines.push(`${error.title}`);

        messageLines.forEach((messageLine) => {
            lines.push(`  ${messageLine}`);
        });

        if (error.location?.file) {
            const locationStr = formatLocation(error.location);

            lines.push(`  at ${locationStr}`);
        }

        if (visibleSuggestions.length > 0) {
            lines.push('\n  Suggestions:');

            visibleSuggestions.forEach((suggestion) => {
                if (suggestion.command) {
                    lines.push(`    • ${suggestion.message}`);
                    lines.push(`      Run: ${suggestion.command}`);
                } else {
                    lines.push(`    • ${suggestion.message}`);
                }
            });
        }
    }

    return lines.join('\n');
}

export function formatSummaryForTerminal(
    errorsByCategory: Record<string, FormattedError[]>,
    totalErrors: number,
    totalWarnings: number,
): string {
    const lines: string[] = [];

    if (totalErrors > 0) {
        lines.push(chalk.red(`\nBuild failed with ${totalErrors} error(s):\n`));
    } else if (totalWarnings > 0) {
        lines.push(chalk.yellow(`\nBuild completed with ${totalWarnings} warning(s):\n`));
    }

    const nonEmptyCategories = Object.entries(errorsByCategory).filter(
        ([, categoryErrors]) => categoryErrors.length > 0,
    );

    for (const [category, categoryErrors] of nonEmptyCategories) {
        const isWarnings = category === 'Warnings';

        if (isWarnings) {
            lines.push(chalk.yellow(`${category}:`));
        } else {
            lines.push(chalk.bold.red(`${category}:`));
        }

        const displayErrors = categoryErrors.slice(0, DEFAULT_ERRORS_LIMIT);

        displayErrors.forEach((error, index) => {
            const prefix = isWarnings ? '  ' : `  ${index + 1}. `;
            const message =
                error.message.length > 80 ? `${error.message.substring(0, 80)}...` : error.message;

            if (isWarnings) {
                lines.push(chalk.yellow(`${prefix}${message}`));
            } else {
                lines.push(`${prefix}${message}`);
            }

            if (error.location?.file) {
                const locationStr = formatLocation(error.location);

                lines.push(chalk.gray(`      at ${locationStr}`));
            }
        });

        if (categoryErrors.length > DEFAULT_ERRORS_LIMIT) {
            lines.push(
                chalk.gray(`      ... and ${categoryErrors.length - DEFAULT_ERRORS_LIMIT} more`),
            );
        }

        lines.push('');
    }

    if (totalErrors > 0) {
        lines.push(chalk.gray(`\nDocs: ${DOCS_BASE_URL}`));
    }

    return lines.join('\n');
}
