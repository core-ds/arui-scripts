import { resolveArtifactsConfig } from '..';

describe('resolveArtifactsConfig', () => {
    it('should fill defaults matching arui-scripts historical behaviour', () => {
        const config = resolveArtifactsConfig({ cwd: __dirname });

        expect(config.docker.baseImage).toBe('alfabankui/arui-scripts:24.10.0-slim');
        expect(config.buildPath).toBe('.build');
        expect(config.serverOutput).toBe('server.js');
        expect(config.serverPort).toBe(3000);
        expect(config.clientOnly).toBe(false);
        expect(config.nginx.rootPath).toBe('/src');
        expect(config.nginx.port).toBe(8080);
        expect(config.nginx.baseConf).toBeNull();
        expect(config.docker.runFromNonRootUser).toBe(true);
        expect(config.docker.tempDirName).toBe('.docker-build');
        expect(config.docker.platform).toBe('auto');
        // arui-scripts считает publicPath как `${assetsPath}/`
        expect(config.assetsPath).toBe('assets');
        expect(config.publicPath).toBe('assets/');
    });

    it('should derive publicPath from a custom assetsPath', () => {
        expect(resolveArtifactsConfig({ cwd: __dirname, assetsPath: 'static' }).publicPath).toBe(
            'static/',
        );
        expect(
            resolveArtifactsConfig({ cwd: __dirname, assetsPath: 'static', publicPath: 'cdn/' })
                .publicPath,
        ).toBe('cdn/');
    });

    it('should default the host pipeline per docker variant', () => {
        const runtime = resolveArtifactsConfig({ cwd: __dirname });

        expect(runtime.docker.variant).toBe('runtime');
        expect(runtime.build.cleanBuildPath).toBe(true);
        expect(runtime.build.command).toBe('npm run build');
        expect(runtime.build.removeDevDependencies).toBe(true);

        const compiled = resolveArtifactsConfig({
            cwd: __dirname,
            docker: { variant: 'compiled' },
        });

        expect(compiled.build.cleanBuildPath).toBe(false);
        expect(compiled.build.command).toBeNull();
        expect(compiled.build.removeDevDependencies).toBe(false);
    });

    it('should default archive options and always build on the host for archives', () => {
        const archive = resolveArtifactsConfig({
            cwd: __dirname,
            artifact: 'archive',
            docker: { variant: 'compiled' },
        });

        expect(archive.archive.name).toBe('build.tar');
        expect(archive.archive.additionalPaths).toEqual(['config']);
        expect(archive.archive.tempDirName).toBe('.archive-build');
        // в tar нечего собирать «внутри», поэтому хост-пайплайн включен даже с variant: compiled
        expect(archive.build.command).toBe('npm run build');
        expect(archive.build.removeDevDependencies).toBe(true);
        expect(archive.build.cleanBuildPath).toBe(true);
    });

    it('should keep temp dirs of docker and archive independent', () => {
        const config = resolveArtifactsConfig({
            cwd: __dirname,
            artifact: 'archive',
            archive: { tempDirName: '.custom' },
        });

        expect(config.archive.tempDirName).toBe('.custom');
        expect(config.docker.tempDirName).toBe('.docker-build');
    });

    it('should allow disabling the host build explicitly', () => {
        expect(
            resolveArtifactsConfig({ cwd: __dirname, build: { command: false } }).build.command,
        ).toBeNull();
        expect(
            resolveArtifactsConfig({
                cwd: __dirname,
                docker: { variant: 'compiled' },
                build: { command: 'make' },
            }).build.command,
        ).toBe('make');
    });

    it('should not push by default in debug mode', () => {
        expect(resolveArtifactsConfig({ cwd: __dirname, debug: true }).docker.push).toBe(false);
        expect(resolveArtifactsConfig({ cwd: __dirname, debug: false }).docker.push).toBe(true);
    });

    it('should allow explicit push override even in debug mode', () => {
        expect(
            resolveArtifactsConfig({ cwd: __dirname, debug: true, docker: { push: true } }).docker
                .push,
        ).toBe(true);
    });

    it('should normalize nginx.baseConf: false to null and fill base conf defaults', () => {
        expect(
            resolveArtifactsConfig({ cwd: __dirname, nginx: { baseConf: false } }).nginx.baseConf,
        ).toBeNull();

        expect(
            resolveArtifactsConfig({ cwd: __dirname, nginx: { baseConf: { workerProcesses: 4 } } })
                .nginx.baseConf,
        ).toEqual({
            workerProcesses: 4,
            workerRlimitNoFile: 20000,
            workerConnections: 19000,
            eventsUse: 'epoll',
            daemon: 'off',
        });
    });

    it('should keep falsy but valid values (empty registry, port 0)', () => {
        const config = resolveArtifactsConfig({
            cwd: __dirname,
            serverPort: 0,
            docker: { registry: '' },
        });

        expect(config.docker.registry).toBe('');
        expect(config.serverPort).toBe(0);
    });

    it('should respect explicit yarnVersion and derived commands', () => {
        const config = resolveArtifactsConfig({
            cwd: __dirname,
            packageManager: { yarnVersion: '2+' },
        });

        expect(config.packageManager.installProductionCommand).toBe(
            'yarn workspaces focus --production --all',
        );
    });

    it('should default local file substitution to allowed', () => {
        const { localFiles } = resolveArtifactsConfig({ cwd: __dirname });

        expect(localFiles.allowDockerfile).toBe(true);
        expect(localFiles.allowStartScript).toBe(true);
        expect(localFiles.dockerfile).toBeNull();
    });
});
