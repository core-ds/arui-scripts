import chalk from 'chalk';

import statsOptions from '../../configs/stats-options';

export default function printCompilerOutput(compilerName: string, stats: any) {
    const output = stats
        .toString(statsOptions)
        .split('\n')
        .map((line: string) => `${chalk.cyan(`[${compilerName}]`)} ${line}`)
        .join('\n');

    console.log(output);
}
