import { spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';

import { configs } from '../../configs/app-configs';

export function runCompilers(pathToCompilers: Array<string | string[]>) {
    if (existsSync(configs.serverOutputPath)) {
        rmSync(configs.serverOutputPath, { recursive: true, force: true });
    }

    const compilers = pathToCompilers.map((pathToCompiler) => {
        if (Array.isArray(pathToCompiler)) {
            const compiler = spawn('node', pathToCompiler, {
                stdio: 'inherit',
                cwd: configs.cwd,
            });

            compiler.on('error', onProcessExit);
            compiler.on('close', onProcessExit);

            return compiler;
        }

        const compiler = spawn('node', [pathToCompiler], {
            stdio: 'inherit',
        });

        compiler.on('error', onProcessExit);
        compiler.on('close', onProcessExit);

        return compiler;
    });

    function onProcessExit(code: number) {
        if (code !== 0) {
            compilers.forEach((compiler) => compiler.kill());
            process.exit(code);
        }
    }
}
