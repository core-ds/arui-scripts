import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const VITEST_CONFIG_FILES = [
    'vitest.config.js',
    'vitest.config.mjs',
    'vitest.config.ts',
    'vitest.config.cjs',
    'vitest.config.mts',
    'vitest.config.cts',
];

export function hasProjectVitestConfig(cwd: string): boolean {
    return VITEST_CONFIG_FILES.some((file) => fs.existsSync(path.join(cwd, file)));
}

type RunVitestParams = {
    args: string[];
    cwd?: string;
};

export function runVitest({ args, cwd = process.cwd() }: RunVitestParams): Promise<number> {
    const aruiVitestConfigPath = path.resolve(__dirname, '../../configs/vitest/config.js');
    const vitestArgs = hasProjectVitestConfig(cwd)
        ? ['run', ...args]
        : ['run', '--config', aruiVitestConfigPath, ...args];

    const vitestDir = path.dirname(require.resolve('vitest/package.json'));
    const vitestBin = path.join(vitestDir, 'vitest.mjs');

    return new Promise((resolve, reject) => {
        const vitestProcess = spawn(process.execPath, [vitestBin, ...vitestArgs], {
            stdio: 'inherit',
            shell: false,
        });

        vitestProcess.on('close', (code) => {
            resolve(code ?? 0);
        });

        vitestProcess.on('error', (error) => {
            reject(error);
        });
    });
}
