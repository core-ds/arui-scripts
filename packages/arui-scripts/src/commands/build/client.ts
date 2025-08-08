import chalk from 'chalk';
import printBuildError from 'react-dev-utils/printBuildError';
import { Configuration, Stats, MultiStats } from '@rspack/core';
import build from './build-wrapper';
import { calculateAssetsSizes, printAssetsSizes } from '../util/client-assets-sizes';
import { webpackClientConfig } from '../../configs/webpack.client.prod';
import { createDictionaryFiles } from '../util/create-dictionary-files';

console.log(chalk.magenta('Building client...'));

async function main() {
    try {
        const { stats, warnings } = await build(webpackClientConfig);

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

        function printOutputSizes(webpackConfig: Configuration, stats: Stats) {
            const sizes = calculateAssetsSizes(stats, webpackConfig?.output?.path);
            printAssetsSizes(sizes);
        }

        if (Array.isArray(webpackClientConfig)) {
            webpackClientConfig.forEach((conf, index) =>
                printOutputSizes(conf as any, (stats as MultiStats).stats[index]),
            );
        } else {
            printOutputSizes(webpackClientConfig as any, stats as Stats);
        }

        try {
            await createDictionaryFiles();
        } catch (error) {
            console.warn('Unable to create dcb files', error);
        }
    } catch (err) {
        console.log(chalk.red('Failed to compile client.\n'));
        printBuildError(err as Error);
        process.exit(1);
    }
}

main();
