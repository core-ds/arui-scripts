import { spawn } from 'child_process';

import fs from 'fs-extra';

import { configs } from '../../configs/app-configs';

export function runCompilers(pathToCompilers: Array<string | string[]>) {
    if (fs.pathExistsSync(configs.serverOutputPath)) {
        fs.removeSync(configs.serverOutputPath);
    }

    const compilers = pathToCompilers.map((pathToCompiler) => {
        const compiler = spawn(
            'node',
            Array.isArray(pathToCompiler) ? pathToCompiler : [pathToCompiler],
            {
                stdio: 'inherit',
                cwd: configs.cwd,
            },
        );

        compiler.on('error', onProcessError);
        compiler.on('close', onProcessClose);

        return compiler;
    });

    function stopCompilers(exitCode: number) {
        compilers.forEach((compiler) => compiler.kill());
        process.exit(exitCode);
    }

    // в error приходит объект ошибки, а не код для выхода
    function onProcessError(error: Error) {
        console.error(error.message);
        stopCompilers(1);
    }

    function onProcessClose(code: number | null) {
        if (code !== 0) {
            // code === null означает, что процесс убит сигналом
            stopCompilers(code ?? 1);
        }
    }
}
