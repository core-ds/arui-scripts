/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */

import chalk from 'chalk';
import { Command } from 'commander';

import { commands } from './commands-registry';

const { version } = require('../../package.json');

export function createCli(): Command {
    const program = new Command('arui-scripts');

    program
        .description('Инструмент для сборки клиентской и серверной части react приложений')
        .version(version, '-v, --version', 'Показать версию')
        .showHelpAfterError('(используйте --help для списка команд)')
        .showSuggestionAfterError();

    program.addHelpText('beforeAll', ({ command }) =>
        command === program
            ? `\n  ${chalk.bgCyan.black(' arui-scripts ')}  ${chalk.dim(`v${version}`)}\n`
            : '',
    );

    commands.forEach((cmd) => {
        const command = program.command(cmd.name).description(cmd.description).action(cmd.load);

        if (cmd.args) {
            command.arguments(cmd.args);
        }

        if (cmd.passthrough) {
            command.allowUnknownOption().allowExcessArguments();
        }

        if (cmd.help) {
            command.addHelpText('after', `\n${chalk.dim(cmd.help)}`);
        }
    });

    return program;
}
