/* eslint import/no-extraneous-dependencies: 0 */
/* eslint no-console: 0 */

import chalk from 'chalk';
import { rspack, Stats, MultiStats, Configuration } from '@rspack/core';
import formatWebpackMessages from '../util/format-webpack-messages';

type BuildResult = {
    stats: Stats | MultiStats;
    warnings: string[];
    previousFileSizes: unknown;
};

function build(
    config: Configuration | Configuration[],
    previousFileSizes?: unknown,
) {
    let compiler = rspack(config);
    return new Promise<BuildResult>((resolve, reject) => {
        compiler.run((err: any, stats: any) => {
            if (err) {
                return reject(err);
            }
            const messages = formatWebpackMessages(stats?.toJson({}));

            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join('\n\n')));
            }
            if (
                process.env.CI &&
                process.env.CI.toLowerCase() !== 'false' &&
                messages.warnings.length
            ) {
                console.log(
                    chalk.yellow(
                        '\nTreating warnings as errors because process.env.CI = true.\n' +
                            'Most CI servers set it automatically.\n',
                    ),
                );
                return reject(new Error(messages.warnings.join('\n\n')));
            }
            return resolve({
                stats,
                warnings: messages.warnings,
                previousFileSizes,
            });
        });
    });
}

export default build;
