import { Configuration,rspack } from '@rspack/core';

import configs from '../../configs/app-configs';
import printCompilerOutput from '../start/print-compiler-output';

export function runServerWatchCompiler(config: Configuration) {

    const serverCompiler = rspack(config);

    serverCompiler.hooks.compile.tap('server', () => console.log('Compiling server...'));
    serverCompiler.hooks.invalid.tap('server', () => console.log('Compiling server...'));
    serverCompiler.hooks.done.tap('server', (stats: any) => printCompilerOutput('Server', stats));

    serverCompiler.watch(
        {
            aggregateTimeout: 50, // Делаем это значение меньше чем у клиента, чтобы сервер пересобирался быстрее
            ignored: new RegExp(configs.watchIgnorePath.join('|')),
        },
        () => {},
    );
}
