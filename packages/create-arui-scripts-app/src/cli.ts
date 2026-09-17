/* eslint-disable no-console */

import chalk from 'chalk';

import { createProgram } from './create-program';

createProgram()
    .parseAsync(process.argv)
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);

        console.error(`${chalk.red('x')} ${message}`);
        process.exit(1);
    });
