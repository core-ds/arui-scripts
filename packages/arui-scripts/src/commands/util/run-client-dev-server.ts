import path from 'path';
import { types } from 'util';

import { type Compiler, type Configuration, type MultiCompiler, rspack } from '@rspack/core';
import { RspackDevServer } from '@rspack/dev-server';
import chalk from 'chalk';

import { devServerConfig } from '../../configs/dev-server';

import { handleCompilationResult } from './error-formatter';
import { printBuildError } from './print-build-error';

function getCompilers(compiler: Compiler | MultiCompiler): Compiler[] {
    // Одиночное условие, чтобы TS сузил тип до Compiler в ветке else
    if ('compilers' in compiler) {
        return compiler.compilers;
    }

    return [compiler];
}

export async function runClientDevServer(configuration: Configuration | Configuration[]) {
    // rspack(array) → MultiCompiler; иначе остальные конфиги не стартуют в DevServer
    const clientCompiler = rspack(configuration);
    const clientDevServer = new RspackDevServer(devServerConfig, clientCompiler);
    const configList = Array.isArray(configuration) ? configuration : [configuration];

    getCompilers(clientCompiler).forEach((compiler, index) => {
        const configName = configList[index]?.name || 'Client';

        // Изменение файла, начало перекомпиляции
        compiler.hooks.invalid.tap(configName, (file) => {
            const filePath =
                typeof file === 'string' ? path.relative(process.cwd(), String(file)) : 'unknown';

            console.log(chalk.gray(`${configName}: ${filePath} changed`));
        });

        // Начало компиляции
        compiler.hooks.compile.tap(configName, () => {
            console.log(chalk.yellow(`${configName}: Compiling...`));
        });

        // Успешное завершение компиляции
        compiler.hooks.done.tap(configName, (stats) => {
            handleCompilationResult(stats, configName);
        });

        // Ошибка компиляции
        compiler.hooks.failed.tap(configName, (error) => {
            console.error(chalk.red(`\n${configName} compilation failed:`));
            printBuildError(error, { showStack: true });
        });
    });

    const DEFAULT_PORT = devServerConfig.port;
    const HOST = '0.0.0.0';

    try {
        const { default: getPort } = await import('get-port');
        const port = await getPort({
            port: +(DEFAULT_PORT || 0),
            host: HOST,
        });

        if (!port) {
            console.error(chalk.red('Could not find an available port'));

            return;
        }

        clientDevServer.startCallback(() => {
            console.log(
                chalk.green(`\n${chalk.bold('Dev server running at')} http://${HOST}:${port}\n`),
            );
        });
    } catch (err) {
        if (types.isNativeError(err)) {
            console.error(chalk.red('\nFailed to start dev server:'));
            printBuildError(err, { showStack: true });
        }

        process.exit(1);
    }
}
