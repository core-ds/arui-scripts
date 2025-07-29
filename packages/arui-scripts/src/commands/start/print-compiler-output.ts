import { type Stats } from '@rspack/core';
import chalk from 'chalk';

import { statsOptions } from '../../configs/stats-options';

export function printCompilerOutput(compilerName: string, stats: Stats) {
    const output = stats
        .toString(statsOptions)
        .split('\n')
        .map((line: string) => `${chalk.cyan(`[${compilerName}]`)} ${line}`)
        .join('\n');

    console.log(output);
}
