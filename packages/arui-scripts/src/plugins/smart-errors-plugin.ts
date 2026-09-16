import { type Compiler, type StatsError } from '@rspack/core';

import {
    createErrorSummary,
    formatError,
    formatErrorForTerminal,
    formatSummaryForTerminal,
    statsErrorToWebpackErrorLike,
} from '../commands/util/error-formatter';

interface StatsJson {
    errors?: StatsError[];
    warnings?: StatsError[];
}

export interface SmartErrorsPluginOptions {
    ignoreWarnings?: boolean;
}

export class SmartErrorsPlugin {
    name = 'SmartErrorsPlugin';

    private options: SmartErrorsPluginOptions;

    constructor(options: SmartErrorsPluginOptions = {}) {
        this.options = options;
    }

    apply(compiler: Compiler) {
        compiler.hooks.done.tap(this.name, (stats) => {
            const statsJson = stats.toJson({ errors: true, warnings: true }) as StatsJson;
            const errors = statsJson.errors || [];
            const warnings = statsJson.warnings || [];

            if (errors.length === 0 && warnings.length === 0) {
                return;
            }

            const formattedErrors = errors.map((errorItem) =>
                formatError(statsErrorToWebpackErrorLike(errorItem)),
            );
            const formattedWarnings = this.options.ignoreWarnings
                ? []
                : warnings.map((warningItem) =>
                      formatError(statsErrorToWebpackErrorLike(warningItem)),
                  );

            const summary = createErrorSummary(formattedErrors, formattedWarnings);

            if (
                summary.totalErrors > 0 ||
                (summary.totalWarnings > 0 && !this.options.ignoreWarnings)
            ) {
                const summaryOutput = formatSummaryForTerminal(
                    summary.errorsByCategory,
                    summary.totalErrors,
                    summary.totalWarnings,
                );

                console.log(`\n${summaryOutput}`);
            }
        });
    }
}

export function createSmartErrorsPlugin(options?: SmartErrorsPluginOptions): SmartErrorsPlugin {
    return new SmartErrorsPlugin(options);
}

export function formatBuildError(error: Error, options?: { maxSuggestions?: number }) {
    const formatted = formatError(error);

    return formatErrorForTerminal(formatted, {
        maxSuggestions: options?.maxSuggestions ?? 3,
    });
}
