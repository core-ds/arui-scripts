import { type Configuration, type MultiStats, type Stats } from '@rspack/core';
import chalk from 'chalk';

import { rspackClientConfig } from '../../configs/rspack.client.prod';
import { printAssetsSizes } from '../util/client-assets-sizes';
import { loadBrowserslist } from '../util/load-browserslist';
import { printBuildError } from '../util/print-build-error';

import build from './build-wrapper';

loadBrowserslist();

console.log(chalk.magenta('Building client...'));

async function main() {
    try {
        const { stats, warnings } = await build(rspackClientConfig);

        if (warnings.length) {
            console.log(chalk.yellow('Client compiled with warnings.\n'));
            console.log(warnings.join('\n\n'));
            console.log(
                `Search for the ${chalk.underline(
                    chalk.yellow('keywords'),
                )} to learn more about each warning.`,
            );
            console.log(
                `To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.`,
            );
        } else {
            console.log(chalk.green('Client compiled successfully.\n'));
        }

        function printOutputSizes(rspackConfig: Configuration, stats: Stats) {
            console.log(chalk.bold(`Sizes for "${rspackConfig.name || 'main'}"`));

            printAssetsSizes(stats);
        }

        if (Array.isArray(rspackClientConfig)) {
            rspackClientConfig.forEach((conf, index) =>
                printOutputSizes(conf, (stats as MultiStats).stats[index]),
            );
        } else {
            printOutputSizes(rspackClientConfig as any, stats as Stats);
        }
    } catch (err) {
        console.log(chalk.red('Failed to compile client.\n'));
        printBuildError(err as Error);
        process.exit(1);
    }
}

main();
