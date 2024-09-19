/* eslint import/no-extraneous-dependencies: 0 */
/* eslint no-console: 0 */
import chalk from 'chalk';
import printBuildError from 'react-dev-utils/printBuildError';
import build from './build-wrapper';

import config from '../../configs/webpack.server.prod';

console.log(chalk.magenta('Building server...'));
console.time('build server');
build(config as any)
    .then(({ warnings }) => {
        console.timeEnd('build server');
        if (warnings.length) {
            console.log(chalk.yellow('Server compiled with warnings.\n'));
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
            console.log(chalk.green('Server compiled successfully.\n'));
        }
    })
    .catch((err) => {
        console.log(chalk.red('Failed to compile server.\n'));
        printBuildError(err);
        process.exit(1);
    });
