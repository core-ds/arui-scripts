import { getAvailableCommands, resolveCommandOptions } from '../config-file';

describe('resolveCommandOptions', () => {
    it('should return null for an unknown command', () => {
        expect(resolveCommandOptions('nope', {})).toBeNull();
    });

    it('should provide built-in commands without any config', () => {
        expect(resolveCommandOptions('docker-build', {})).toMatchObject({
            variant: 'runtime',
            allowLocalDockerfile: true,
            addNodeModulesToDockerIgnore: false,
        });

        expect(resolveCommandOptions('docker-build:compiled', {})).toMatchObject({
            variant: 'compiled',
            allowLocalDockerfile: false,
            addNodeModulesToDockerIgnore: true,
        });
    });

    it('should provide archive-build as a built-in command', () => {
        expect(resolveCommandOptions('archive-build', {})).toMatchObject({ artifact: 'archive' });
    });

    it('should let a project declare an extra archive command', () => {
        const options = resolveCommandOptions('archive-build:e2e', {
            archiveName: 'build.tar',
            commands: {
                'archive-build:e2e': { artifact: 'archive' as const, archiveName: 'e2e.tar' },
            },
        });

        expect(options).toMatchObject({ artifact: 'archive', archiveName: 'e2e.tar' });
    });

    it('should apply shared config options to every command', () => {
        const configFile = { baseDockerImage: 'my/base:1.0.0', serverPort: 4000 };

        expect(resolveCommandOptions('docker-build', configFile)).toMatchObject({
            baseDockerImage: 'my/base:1.0.0',
            serverPort: 4000,
            variant: 'runtime',
        });
    });

    it('should let a command section win over shared options', () => {
        const options = resolveCommandOptions('docker-build:compiled', {
            serverPort: 4000,
            commands: { 'docker-build:compiled': { serverPort: 5000 } },
        });

        expect(options).toMatchObject({ serverPort: 5000, variant: 'compiled' });
    });

    it('should let the config override built-in command defaults', () => {
        const options = resolveCommandOptions('docker-build:compiled', {
            commands: { 'docker-build:compiled': { allowLocalDockerfile: true } },
        });

        expect(options).toMatchObject({ allowLocalDockerfile: true, variant: 'compiled' });
    });

    it('should support fully custom commands declared in the config', () => {
        const configFile = {
            baseDockerImage: 'my/base:1.0.0',
            commands: {
                'docker-build:server': {
                    variant: 'compiled' as const,
                    serverOutput: 'server/index.js',
                    clientServerPort: 9090,
                },
            },
        };

        expect(resolveCommandOptions('docker-build:server', configFile)).toMatchObject({
            baseDockerImage: 'my/base:1.0.0',
            serverOutput: 'server/index.js',
            clientServerPort: 9090,
            variant: 'compiled',
        });
    });

    it('should shallow-merge nested option objects instead of replacing them', () => {
        const options = resolveCommandOptions('docker-build', {
            nginx: { workerProcesses: 4, workerConnections: 100 },
            extraBuildArgs: { A: '1' },
            commands: {
                'docker-build': { nginx: { workerProcesses: 8 }, extraBuildArgs: { B: '2' } },
            },
        });

        expect(options?.nginx).toEqual({ workerProcesses: 8, workerConnections: 100 });
        expect(options?.extraBuildArgs).toEqual({ A: '1', B: '2' });
    });

    it('should not merge nginx: false into an object', () => {
        const options = resolveCommandOptions('docker-build', {
            nginx: { workerProcesses: 4 },
            commands: { 'docker-build': { nginx: false } },
        });

        expect(options?.nginx).toBe(false);
    });

    it('should not leak the commands key into build options', () => {
        const options = resolveCommandOptions('docker-build', {
            commands: { 'docker-build': {} },
        });

        expect(options).not.toHaveProperty('commands');
    });
});

describe('getAvailableCommands', () => {
    it('should list built-in and declared commands without duplicates', () => {
        const commands = getAvailableCommands({
            commands: { 'docker-build': {}, 'docker-build:server': {} },
        });

        expect(commands).toEqual([
            'docker-build',
            'docker-build:compiled',
            'archive-build',
            'docker-build:server',
        ]);
    });
});
