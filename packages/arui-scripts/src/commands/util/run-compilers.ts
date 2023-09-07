import checkRequiredFiles from './check-required-files';
import fs from 'fs-extra';
import configs from '../../configs/app-configs';
import { spawn } from 'child_process';

export function runCompilers(pathToCompilers: Array<string | string[] | null | boolean>) {
    if (!checkRequiredFiles()) {
        process.exit(1);
    }

    if (fs.pathExistsSync(configs.serverOutputPath)) {
        fs.removeSync(configs.serverOutputPath);
    }

    const pathToCompilersFiltered = pathToCompilers.filter(Boolean) as Array<string | string[]>;

    const compilers = pathToCompilersFiltered.map((pathToCompiler) => {
        const compiler = spawn(
            'node',
            Array.isArray(pathToCompiler) ? pathToCompiler : [pathToCompiler],
            { stdio: 'inherit', cwd: configs.cwd },
        );

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
