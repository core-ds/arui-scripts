import { type Command } from 'commander';

import { createCli, extractConfigPath, type RunCommandParams } from '../cli';
import { type ArtifactsConfigFile } from '../config-file';

describe('extractConfigPath', () => {
    it('should return undefined when the flag is absent', () => {
        expect(extractConfigPath(['docker-build', 'version=1.0.0'])).toBeUndefined();
    });

    it.each(['--config', '--c', '-c'])('should support %s with a separate value', (flag) => {
        expect(extractConfigPath(['docker-build', flag, './docker.ts'])).toBe('./docker.ts');
    });

    it.each(['--config', '--c'])('should support %s with an equals sign', (flag) => {
        expect(extractConfigPath(['docker-build', `${flag}=./docker.ts`])).toBe('./docker.ts');
    });

    it('should not choke on commands and args it knows nothing about', () => {
        expect(extractConfigPath(['some:custom:command', 'name=app', '-c', './docker.ts'])).toBe(
            './docker.ts',
        );
    });
});

describe('createCli', () => {
    function setup(configFile: ArtifactsConfigFile = {}) {
        const runs: RunCommandParams[] = [];
        const program = createCli({
            configFile,
            version: '1.2.3',
            run: (params) => {
                runs.push(params);
            },
        });

        program.exitOverride();
        program.commands.forEach((command: Command) => command.exitOverride());
        program.configureOutput({ writeOut: () => {}, writeErr: () => {} });

        return { program, runs };
    }

    it('should run a built-in command', async () => {
        const { program, runs } = setup();

        await program.parseAsync(['docker-build'], { from: 'user' });

        expect(runs).toEqual([{ command: 'docker-build', args: [] }]);
    });

    it('should pass name=/version=/registry= through as command args', async () => {
        const { program, runs } = setup();

        await program.parseAsync(
            ['docker-build', 'name=app', 'version=2.0.0', 'registry=r.example.com'],
            { from: 'user' },
        );

        expect(runs[0].args).toEqual(['name=app', 'version=2.0.0', 'registry=r.example.com']);
    });

    it('should not treat the config flag as a command arg', async () => {
        const { program, runs } = setup();

        await program.parseAsync(['docker-build', '-c', './docker.ts', 'version=2.0.0'], {
            from: 'user',
        });

        expect(runs[0].args).toEqual(['version=2.0.0']);
    });

    it('should register commands declared in the project config', async () => {
        const { program, runs } = setup({
            commands: { 'docker-build:server': { variant: 'compiled' } },
        });

        await program.parseAsync(['docker-build:server'], { from: 'user' });

        expect(runs).toEqual([{ command: 'docker-build:server', args: [] }]);
    });

    it('should list custom commands in help', () => {
        const { program } = setup({ commands: { 'docker-build:static': {} } });

        const help = program.helpInformation();

        expect(help).toContain('docker-build');
        expect(help).toContain('docker-build:compiled');
        expect(help).toContain('docker-build:static');
    });

    it('should reject an unknown command instead of silently doing nothing', async () => {
        const { program, runs } = setup();

        await expect(program.parseAsync(['docker-build:nope'], { from: 'user' })).rejects.toThrow();
        expect(runs).toHaveLength(0);
    });
});
