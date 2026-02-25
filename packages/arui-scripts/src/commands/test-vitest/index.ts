import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// расширения как в Vite (vite.config.* -> vitest.config.*)
const VITEST_CONFIG_FILES = [
    'vitest.config.js',
    'vitest.config.mjs',
    'vitest.config.ts',
    'vitest.config.cjs',
    'vitest.config.mts',
    'vitest.config.cts',
];

function hasProjectVitestConfig(cwd: string): boolean {
    return VITEST_CONFIG_FILES.some((file) => fs.existsSync(path.join(cwd, file)));
}

const cwd = process.cwd();
const aruiVitestConfigPath = path.resolve(__dirname, '../../configs/vitest/config.js');
const args = process.argv.slice(3);

const vitestArgs = hasProjectVitestConfig(cwd)
    ? ['run', ...args]
    : ['run', '--config', aruiVitestConfigPath, ...args];

const vitestDir = path.dirname(require.resolve('vitest/package.json'));
const vitestBin = path.join(vitestDir, 'vitest.mjs');

const vitestProcess = spawn(process.execPath, [vitestBin, ...vitestArgs], {
    stdio: 'inherit',
    shell: false,
});

vitestProcess.on('close', (code) => {
    process.exit(code ?? 0);
});
