import chalk from 'chalk';

import { formatBuildError } from '../../plugins/smart-errors-plugin';

import { DOCS_BASE_URL } from './error-patterns';

// Выводит ошибку сборки с подсказками по исправлению
export function printBuildError(
    err: Error | null | undefined,
    options?: {
        showStack?: boolean;
        showSuggestions?: boolean;
    },
) {
    const { showStack = false, showSuggestions = true } = options || {};

    if (!err) {
        return;
    }

    const { message } = err;
    const { stack } = err;

    if (stack && typeof message === 'string' && message.includes('from Terser')) {
        try {
            // Из stack trace извлекаем путь к файлу, номер строки и колонки
            // Формат: ...at (file.js:1:2)[file.js:1,2,3][file.js:1,2]
            const matched = /(.+)\[(.+):(.+),(.+)\]\[.+\]/.exec(stack);

            if (!matched) {
                console.log(chalk.red('Failed to minify the bundle.'));

                if (showStack) {
                    console.log(stack);
                }

                console.log(`Please report this issue: ${DOCS_BASE_URL}`);

                return;
            }

            const problemPath = matched[2];
            const line = matched[3];
            const column = matched[4];

            const columnFormatted = column === '0' ? '' : `:${column}`;

            console.log(
                `Failed to minify the code from this file: \n\n${chalk.yellow(
                    `\t${problemPath}:${line}${columnFormatted}`,
                )}\n`,
            );
            console.log(`Please report this issue: ${DOCS_BASE_URL}`);
        } catch {
            console.log(chalk.red('Bundle minification error.'));
            if (showStack) {
                console.log(stack);
            }
        }
        console.log('\n');

        return;
    }

    console.log(
        formatBuildError(err, {
            maxSuggestions: showSuggestions ? 3 : 0,
        }),
    );

    if (showStack && stack) {
        console.log(chalk.gray('\nStack trace:'));
        console.log(stack);
    }

    console.log('\n');
}
