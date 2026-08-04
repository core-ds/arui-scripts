import { type Configuration, rspack } from '@rspack/core';
import chalk from 'chalk';

import { configs } from '../../configs/app-configs';
import { createWatchIgnoreRegex } from '../../configs/util/create-watch-ignore-regex';

import { handleCompilationResult } from './error-formatter';
import { printBuildError } from './print-build-error';

export function runServerWatchCompiler(config: Configuration) {
    const serverCompiler = rspack(config);

    // Начало компиляции
    serverCompiler.hooks.compile.tap('server', () => {
        console.log(chalk.yellow('Server: Compiling...'));
    });

    // Изменение файла, начало перекомпиляции
    serverCompiler.hooks.invalid.tap('server', (file) => {
        const filePath = typeof file === 'string' ? file : 'unknown';

        console.log(chalk.gray(`Server: ${filePath} changed`));
    });

    // Успешное завершение компиляции
    serverCompiler.hooks.done.tap('server', (stats) => {
        handleCompilationResult(stats, 'Server');
    });

    // Ошибка компиляции
    serverCompiler.hooks.failed.tap('server', (error) => {
        console.error(chalk.red('\nServer compilation failed:'));

        printBuildError(error, { showStack: true });
    });

    serverCompiler.watch(
        {
            aggregateTimeout: 50, // Делаем это значение меньше чем у клиента, чтобы сервер пересобирался быстрее
            ignored: createWatchIgnoreRegex(configs.watchIgnorePath),
        },
        () => {},
    );
}
