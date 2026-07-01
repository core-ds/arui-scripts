import { resolveDockerConfig } from '../config';

describe('resolveDockerConfig', () => {
    it('should fill defaults matching arui-scripts historical behaviour', () => {
        const config = resolveDockerConfig({ cwd: __dirname });

        expect(config.baseDockerImage).toBe('alfabankui/arui-scripts:24.10.0-slim');
        expect(config.buildPath).toBe('.build');
        expect(config.serverOutput).toBe('server.js');
        expect(config.nginxRootPath).toBe('/src');
        expect(config.clientServerPort).toBe(8080);
        expect(config.serverPort).toBe(3000);
        expect(config.runFromNonRootUser).toBe(true);
        expect(config.clientOnly).toBe(false);
        expect(config.tempDirName).toBe('.docker-build');
        expect(config.platform).toBe('auto');
        expect(config.nginx).toBeNull();
    });

    it('should not push by default in debug mode', () => {
        expect(resolveDockerConfig({ cwd: __dirname, debug: true }).push).toBe(false);
        expect(resolveDockerConfig({ cwd: __dirname, debug: false }).push).toBe(true);
    });

    it('should allow explicit push override even in debug mode', () => {
        expect(resolveDockerConfig({ cwd: __dirname, debug: true, push: true }).push).toBe(true);
    });

    it('should normalize nginx: false to null', () => {
        expect(resolveDockerConfig({ cwd: __dirname, nginx: false }).nginx).toBeNull();
        expect(
            resolveDockerConfig({ cwd: __dirname, nginx: { workerProcesses: 4 } }).nginx,
        ).toEqual({ workerProcesses: 4 });
    });

    it('should keep falsy but valid values (empty registry, port 0)', () => {
        const config = resolveDockerConfig({ cwd: __dirname, dockerRegistry: '', serverPort: 0 });

        expect(config.dockerRegistry).toBe('');
        expect(config.serverPort).toBe(0);
    });

    it('should respect explicit yarnVersion and derived commands', () => {
        const config = resolveDockerConfig({ cwd: __dirname, yarnVersion: '2+' });

        expect(config.installProductionCommand).toBe('yarn workspaces focus --production --all');
    });
});
