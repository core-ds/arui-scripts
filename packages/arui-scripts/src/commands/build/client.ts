import { type Configuration, type StatsCompilation } from '@rspack/core';
import chalk from 'chalk';

import { webpackClientConfig } from '../../configs/rspack.client.prod';
import { printAssetsSizes } from '../util/client-assets-sizes';
import { loadBrowserslist } from '../util/load-browserslist';
import { printBuildError } from '../util/print-build-error';

import build from './build-wrapper';

loadBrowserslist();

console.log(chalk.magenta('Building client...'));

function printOutputSizes(webpackConfig: Configuration, stats: StatsCompilation) {
    console.log(chalk.bold(`Sizes for "${webpackConfig.name || 'main'}"`));

    printAssetsSizes({ toJson: () => stats });
}

async function main() {
    try {
        const { assets, warnings } = await build(webpackClientConfig);

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

        if (Array.isArray(webpackClientConfig)) {
            webpackClientConfig.forEach((conf, index) => printOutputSizes(conf, assets[index]));
        } else {
            printOutputSizes(webpackClientConfig, assets[0]);
        }
    } catch (err) {
        console.log(chalk.red('Failed to compile client.\n'));
        printBuildError(err as Error);
        process.exit(1);
    }
}

main();
