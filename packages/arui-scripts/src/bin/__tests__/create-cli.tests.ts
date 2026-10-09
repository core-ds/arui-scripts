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
    program.commands.forEach((command) => command.exitOverride());
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
    it('registers all commands from the registry', () => {
        const program = createCli();
        const registered = program.commands.map((command) => command.name());

        expect(registered).toEqual(commands.map((cmd) => cmd.name));
    });

    it('prints the package version with --version', () => {
        const { captured, error } = run(['--version']);

        expect(captured.out).toContain(version);
        expect(error?.code).toBe('commander.version');
    });

    it('lists available commands with --help', () => {
        const { captured } = run(['--help']);

        expect(captured.out).toContain('start');
        expect(captured.out).toContain('build');
        expect(captured.out).toContain('docker-build');
    });

    it('returns a nonzero exit code for unknown commands', () => {
        const { error } = run(['buld']);

        expect(error).toBeInstanceOf(CommanderError);
        expect(error?.exitCode).not.toBe(0);
    });

    it('suggests a similar command for a typo', () => {
        const { captured } = run(['buld']);

        expect(captured.err).toContain('build');
    });

    it('disables built-in --help for passthrough commands', () => {
        const program = createCli();
        const testCmd = program.commands.find((command) => command.name() === 'test');
        const vitestCmd = program.commands.find((command) => command.name() === 'test:vitest');

        expect(testCmd?.options.some((option) => option.long === '--help')).toBe(false);
        expect(vitestCmd?.options.some((option) => option.long === '--help')).toBe(false);
    });

    it('requires the current snapshot directory for bundle-diff', () => {
        const { error } = run(['bundle-diff']);

        expect(error?.code).toBe('commander.missingMandatoryOptionValue');
    });

    it('lists bundle-diff baseline and report options in help', () => {
        const { captured } = run(['bundle-diff', '--help']);

        expect(captured.out).toContain('--baseline <directory>');
        expect(captured.out).toContain('--report-url <url>');
    });
});
