import checkRequiredFiles from './check-required-files';
import fs from 'fs-extra';
import configs from '../../configs/app-configs';
import { spawn } from 'child_process';

export function runCompilers(pathToCompilers: string[]) {
    if (!checkRequiredFiles()) {
        process.exit(1);
    }

    if (fs.pathExistsSync(configs.serverOutputPath)) {
        fs.removeSync(configs.serverOutputPath);
    }

    const compilers = pathToCompilers.map((pathToCompiler) => {
        const compiler = spawn('node', [pathToCompiler], { stdio: 'inherit' });

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
