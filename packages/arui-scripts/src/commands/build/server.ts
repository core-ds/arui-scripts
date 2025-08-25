import chalk from 'chalk';
import printBuildError from 'react-dev-utils/printBuildError';
import build from './build-wrapper';

import { webpackServerConfig } from '../../configs/webpack.server.prod';
import { supportingNode } from '../../configs/supporting-node';

process.env.BROWSERSLIST = supportingNode.join(',');

console.log(chalk.magenta('Building server...'));

build(webpackServerConfig)
    .then(({ warnings }) => {
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
