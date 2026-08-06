import { getAvailableCommands, resolveCommandOptions } from '../config-file';

describe('resolveCommandOptions', () => {
    it('should return null for an unknown command', () => {
        expect(resolveCommandOptions('nope', {})).toBeNull();
    });

    it('should provide built-in commands without any config', () => {
        expect(resolveCommandOptions('docker-build', {})).toMatchObject({
            docker: { variant: 'runtime', addNodeModulesToDockerIgnore: false },
            localFiles: { allowDockerfile: true },
        });

        expect(resolveCommandOptions('docker-build:compiled', {})).toMatchObject({
            docker: { variant: 'compiled', addNodeModulesToDockerIgnore: true },
            localFiles: { allowDockerfile: false },
        });
    });

    it('should provide archive-build as a built-in command', () => {
        expect(resolveCommandOptions('archive-build', {})).toMatchObject({ artifact: 'archive' });
    });

    it('should let a project declare an extra archive command', () => {
        const options = resolveCommandOptions('archive-build:e2e', {
            archive: { name: 'build.tar' },
            commands: {
                'archive-build:e2e': { artifact: 'archive' as const, archive: { name: 'e2e.tar' } },
            },
        });

        expect(options).toMatchObject({ artifact: 'archive', archive: { name: 'e2e.tar' } });
    });

    it('should apply shared config options to every command', () => {
        const configFile = { docker: { baseImage: 'my/base:1.0.0' }, serverPort: 4000 };

        expect(resolveCommandOptions('docker-build', configFile)).toMatchObject({
            docker: { baseImage: 'my/base:1.0.0', variant: 'runtime' },
            serverPort: 4000,
        });
    });

    it('should let a command section win over shared options', () => {
        const options = resolveCommandOptions('docker-build:compiled', {
            serverPort: 4000,
            commands: { 'docker-build:compiled': { serverPort: 5000 } },
        });

        expect(options).toMatchObject({ serverPort: 5000, docker: { variant: 'compiled' } });
    });

    it('should let the config override built-in command defaults', () => {
        const options = resolveCommandOptions('docker-build:compiled', {
            commands: { 'docker-build:compiled': { localFiles: { allowDockerfile: true } } },
        });

        expect(options).toMatchObject({
            localFiles: { allowDockerfile: true },
            docker: { variant: 'compiled' },
        });
    });

    it('should support fully custom commands declared in the config', () => {
        const configFile = {
            docker: { baseImage: 'my/base:1.0.0' },
            commands: {
                'docker-build:server': {
                    docker: { variant: 'compiled' as const },
                    serverOutput: 'server/index.js',
                    nginx: { port: 9090 },
                },
            },
        };

        expect(resolveCommandOptions('docker-build:server', configFile)).toMatchObject({
            docker: { baseImage: 'my/base:1.0.0', variant: 'compiled' },
            serverOutput: 'server/index.js',
            nginx: { port: 9090 },
        });
    });

    it('should merge config sections field by field instead of replacing them', () => {
        const options = resolveCommandOptions('docker-build', {
            nginx: { port: 8080, baseConf: { workerProcesses: 4, workerConnections: 100 } },
            docker: { buildArgs: { A: '1' } },
            commands: {
                'docker-build': {
                    nginx: { baseConf: { workerProcesses: 8 } },
                    docker: { buildArgs: { B: '2' } },
                },
            },
        });

        expect(options?.nginx).toEqual({
            port: 8080,
            baseConf: { workerProcesses: 8, workerConnections: 100 },
        });
        expect(options?.docker?.buildArgs).toEqual({ A: '1', B: '2' });
    });

    it('should not merge nginx.baseConf: false into an object', () => {
        const options = resolveCommandOptions('docker-build', {
            nginx: { baseConf: { workerProcesses: 4 } },
            commands: { 'docker-build': { nginx: { baseConf: false } } },
        });

        expect(options?.nginx?.baseConf).toBe(false);
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
