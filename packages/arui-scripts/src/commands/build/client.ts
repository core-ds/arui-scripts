import { type Configuration, type MultiStats, type Stats } from '@rspack/core';
import chalk from 'chalk';

import { configs } from '../../configs/app-configs';
import { rspackClientConfig } from '../../configs/rspack.client.prod';
import { BuildSizeBudgetError, checkBuildSizeBudgets } from '../util/build-size-budgets';
import { printAssetsSizes } from '../util/client-assets-sizes';
import { loadBrowserslist } from '../util/load-browserslist';
import { printBuildError } from '../util/print-build-error';
import { enableRsdoctor, writeRsdoctorSnapshot } from '../util/rsdoctor-snapshot';

import build from './build-wrapper';

loadBrowserslist();

console.log(chalk.magenta('Building client...'));

async function printOutputSizes(webpackConfig: Configuration, stats: Stats) {
    const name = webpackConfig.name || 'main';

    console.log(chalk.bold(`Sizes for "${name}"`));

    try {
        printAssetsSizes(stats);
    } catch (error) {
        console.warn(
            chalk.yellow(
                `Could not report asset sizes for "${name}": ${
                    error instanceof Error ? error.message : String(error)
                }`,
            ),
        );
    }

    await checkBuildSizeBudgets(stats, configs.buildSizeBudgets, name);
}

async function main() {
    try {
        const snapshot = await enableRsdoctor(
            rspackClientConfig,
            process.env.ARUI_SCRIPTS_RSDOCTOR_OUTPUT,
            configs.appSrc,
        );
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

        if (Array.isArray(rspackClientConfig)) {
            for (const [index, conf] of rspackClientConfig.entries()) {
                // measure builds sequentially to bound gzip memory use
                // eslint-disable-next-line no-await-in-loop
                await printOutputSizes(conf, (stats as MultiStats).stats[index]);
            }
        } else {
            await printOutputSizes(rspackClientConfig, stats as Stats);
        }

        if (snapshot) {
            await writeRsdoctorSnapshot(snapshot);
        }
    } catch (err) {
        if (err instanceof BuildSizeBudgetError) {
            process.exit(1);
        }

        console.log(chalk.red('Failed to compile client.\n'));
        printBuildError(err as Error);
        process.exit(1);
    }
}

main();
