import { spawn } from 'child_process';
import path from 'path';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw err;
});

const vitestConfigPath = path.resolve(__dirname, '../../configs/vitest/config.js');
const args = process.argv.slice(3);
const vitestArgs = ['run', '--config', vitestConfigPath, ...args];

const vitestDir = path.dirname(require.resolve('vitest/package.json'));
const vitestBin = path.join(vitestDir, 'vitest.mjs');

const vitestProcess = spawn(process.execPath, [vitestBin, ...vitestArgs], {
    stdio: 'inherit',
    shell: false,
});

vitestProcess.on('close', (code) => {
    process.exit(code ?? 0);
});
