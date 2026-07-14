import { type Command, CommanderError } from 'commander';

import { commands } from '../commands-registry';
import { createCli } from '../create-cli';

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
const { version } = require('../../../package.json');

type Captured = { out: string; err: string };

function run(args: string[]): { captured: Captured; error?: CommanderError } {
    const captured: Captured = { out: '', err: '' };
    const program: Command = createCli();

    program.exitOverride();
    program.configureOutput({
        writeOut: (str) => {
            captured.out += str;
        },
        writeErr: (str) => {
            captured.err += str;
        },
    });

    try {
        program.parse(args, { from: 'user' });

        return { captured };
    } catch (error) {
        return { captured, error: error as CommanderError };
    }
}

describe('createCli', () => {
    it('регистрирует все команды из реестра', () => {
        const program = createCli();
        const registered = program.commands.map((command) => command.name());

        expect(registered).toEqual(commands.map((cmd) => cmd.name));
    });

    it('по --version печатает версию пакета', () => {
        const { captured, error } = run(['--version']);

        expect(captured.out).toContain(version);
        expect(error?.code).toBe('commander.version');
    });

    it('по --help выводит список команд', () => {
        const { captured } = run(['--help']);

        expect(captured.out).toContain('start');
        expect(captured.out).toContain('build');
        expect(captured.out).toContain('docker-build');
    });

    it('на неизвестную команду завершается с ненулевым кодом', () => {
        const { error } = run(['buld']);

        expect(error).toBeInstanceOf(CommanderError);
        expect(error?.exitCode).not.toBe(0);
    });

    it('предлагает похожую команду при опечатке', () => {
        const { captured } = run(['buld']);

        expect(captured.err).toContain('build');
    });
});
