import { resolveArtifactsConfig } from '../config';

describe('resolveArtifactsConfig', () => {
    it('should fill defaults matching arui-scripts historical behaviour', () => {
        const config = resolveArtifactsConfig({ cwd: __dirname });

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

    it('should default the host pipeline per variant', () => {
        const runtime = resolveArtifactsConfig({ cwd: __dirname });

        expect(runtime.variant).toBe('runtime');
        expect(runtime.cleanBuildPath).toBe(true);
        expect(runtime.buildCommand).toBe('npm run build');
        expect(runtime.removeDevDependencies).toBe(true);

        const compiled = resolveArtifactsConfig({ cwd: __dirname, variant: 'compiled' });

        expect(compiled.cleanBuildPath).toBe(false);
        expect(compiled.buildCommand).toBeNull();
        expect(compiled.removeDevDependencies).toBe(false);
    });

    it('should default archive options and always build on the host for archives', () => {
        const archive = resolveArtifactsConfig({ cwd: __dirname, artifact: 'archive' });

        expect(archive.archiveName).toBe('build.tar');
        expect(archive.additionalBuildPath).toEqual(['config']);
        expect(archive.tempDirName).toBe('.archive-build');
        // в tar нечего собирать «внутри», поэтому хост-пайплайн включен даже с variant: compiled
        expect(archive.buildCommand).toBe('npm run build');
        expect(archive.removeDevDependencies).toBe(true);
        expect(archive.cleanBuildPath).toBe(true);
    });

    it('should keep the docker temp dir for docker artifacts', () => {
        expect(resolveArtifactsConfig({ cwd: __dirname }).tempDirName).toBe('.docker-build');
        expect(
            resolveArtifactsConfig({ cwd: __dirname, artifact: 'archive', tempDirName: '.custom' })
                .tempDirName,
        ).toBe('.custom');
    });

    it('should allow disabling the host build explicitly', () => {
        expect(
            resolveArtifactsConfig({ cwd: __dirname, buildCommand: false }).buildCommand,
        ).toBeNull();
        expect(
            resolveArtifactsConfig({ cwd: __dirname, variant: 'compiled', buildCommand: 'make' })
                .buildCommand,
        ).toBe('make');
    });

    it('should not push by default in debug mode', () => {
        expect(resolveArtifactsConfig({ cwd: __dirname, debug: true }).push).toBe(false);
        expect(resolveArtifactsConfig({ cwd: __dirname, debug: false }).push).toBe(true);
    });

    it('should allow explicit push override even in debug mode', () => {
        expect(resolveArtifactsConfig({ cwd: __dirname, debug: true, push: true }).push).toBe(true);
    });

    it('should normalize nginx: false to null', () => {
        expect(resolveArtifactsConfig({ cwd: __dirname, nginx: false }).nginx).toBeNull();
        expect(
            resolveArtifactsConfig({ cwd: __dirname, nginx: { workerProcesses: 4 } }).nginx,
        ).toEqual({ workerProcesses: 4 });
    });

    it('should keep falsy but valid values (empty registry, port 0)', () => {
        const config = resolveArtifactsConfig({
            cwd: __dirname,
            dockerRegistry: '',
            serverPort: 0,
        });

        expect(config.dockerRegistry).toBe('');
        expect(config.serverPort).toBe(0);
    });

    it('should respect explicit yarnVersion and derived commands', () => {
        const config = resolveArtifactsConfig({ cwd: __dirname, yarnVersion: '2+' });

        expect(config.installProductionCommand).toBe('yarn workspaces focus --production --all');
    });
});
