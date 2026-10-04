import { type Configuration } from '@rspack/core';

import { configs } from '../../configs/app-configs';
import { createWatchIgnoreRegex } from '../../configs/util/create-watch-ignore-regex';
import { printCompilerOutput } from '../start/print-compiler-output';

import { createCompiler } from './create-compiler';
import { closeCompiler, registerShutdown } from './graceful-shutdown';

export function runServerWatchCompiler(config: Configuration) {
    const serverCompiler = createCompiler(config);

    registerShutdown(() => closeCompiler(serverCompiler));

    serverCompiler.hooks.compile.tap('server', () => console.log('Compiling server...'));
    serverCompiler.hooks.invalid.tap('server', () => console.log('Compiling server...'));
    serverCompiler.hooks.done.tap('server', (stats) => printCompilerOutput('Server', stats));

    serverCompiler.watch(
        {
            aggregateTimeout: 50, // Делаем это значение меньше чем у клиента, чтобы сервер пересобирался быстрее
            ignored: createWatchIgnoreRegex(configs.watchIgnorePath),
        },
        () => {},
    );
}
