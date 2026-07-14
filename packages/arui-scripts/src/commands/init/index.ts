import chalk from 'chalk';

import { runInit } from './run';

// аргумент dir: process.argv = ['node', 'arui-scripts', 'init', '<dir>'].
const targetDirArg = process.argv.slice(3)[0];

runInit({ targetDirArg }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);

    // eslint-disable-next-line no-console
    console.error(`${chalk.red('✖')} ${message}`);
    process.exit(1);
});
