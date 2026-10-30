import { resolveArtifactsConfig, resolveCommandOptions } from '@alfalab/arui-scripts-artifacts';

import { type AppContextWithConfigs } from '../../../configs/app-configs/types';
import { mapArtifactsConfig } from '../map-artifacts-config';

jest.mock('../../../configs/app-configs', () => {
    throw new Error('The mapper must not load the global application config');
});

const config = {
    name: 'my-app',
    version: '2.3.4',
    cwd: '/project',
    debug: true,
    clientOnly: true,
    buildPath: 'dist',
    serverOutput: 'backend.js',
    serverPort: 3001,
    assetsPath: 'static',
    publicPath: '/static/',
    dockerRegistry: 'registry.example.com',
    baseDockerImage: 'company/base:1',
    runFromNonRootUser: false,
    deleteNpm: true,
    clientServerPort: 8081,
    nginxRootPath: '/app',
    nginx: { workerProcesses: 4 },
    dictionaryCompression: { enablePreviousVersionHeaders: true },
    archiveName: 'app.tar',
    additionalBuildPath: ['config', 'data'],
    removeDevDependenciesDuringDockerBuild: false,
    useYarn: false,
    localDockerfile: '/project/Dockerfile',
    localStartScript: '/project/start.sh',
    localNginxConf: '/project/nginx.conf',
    localNginxBaseConf: '/project/base-nginx.conf',
} as AppContextWithConfigs;

it('translates application settings into standalone artifact options', () => {
    expect(mapArtifactsConfig(config)).toEqual({
        name: 'my-app',
        version: '2.3.4',
        cwd: '/project',
        debug: true,
        clientOnly: true,
        buildPath: 'dist',
        serverOutput: 'backend.js',
        serverPort: 3001,
        assetsPath: 'static',
        publicPath: '/static/',
        docker: {
            registry: 'registry.example.com',
            baseImage: 'company/base:1',
            runFromNonRootUser: false,
            deleteNpm: true,
        },
        nginx: {
            port: 8081,
            rootPath: '/app',
            enablePreviousVersionHeaders: true,
            baseConf: { workerProcesses: 4 },
        },
        archive: { name: 'app.tar', additionalPaths: ['config', 'data'] },
        build: { removeDevDependencies: false },
        packageManager: { useYarn: false },
        localFiles: {
            dockerfile: '/project/Dockerfile',
            startScript: '/project/start.sh',
            nginxConf: '/project/nginx.conf',
            nginxBaseConf: '/project/base-nginx.conf',
        },
        commands: { 'archive-build': { build: { removeDevDependencies: true } } },
    });
});

it('preserves false and empty values rather than applying defaults', () => {
    const options = mapArtifactsConfig({
        ...config,
        dockerRegistry: '',
        archiveName: '',
        additionalBuildPath: [],
        nginx: null,
        deleteNpm: false,
        dictionaryCompression: { dictionaryPath: [], enablePreviousVersionHeaders: false },
    });
    const resolved = resolveArtifactsConfig(options);

    expect(resolved.docker.registry).toBe('');
    expect(resolved.docker.runFromNonRootUser).toBe(false);
    expect(resolved.docker.deleteNpm).toBe(false);
    expect(resolved.nginx.baseConf).toBeNull();
    expect(resolved.nginx.enablePreviousVersionHeaders).toBe(false);
    expect(resolved.archive.name).toBe('');
    expect(resolved.archive.additionalPaths).toEqual([]);
    expect(resolved.build.removeDevDependencies).toBe(false);
    expect(resolved.packageManager.useYarn).toBe(false);
});

it('leaves missing artifact settings to the shared resolver', () => {
    const options = mapArtifactsConfig({
        ...config,
        dockerRegistry: undefined,
        baseDockerImage: undefined,
        nginxRootPath: undefined,
        nginx: undefined,
        runFromNonRootUser: undefined,
        removeDevDependenciesDuringDockerBuild: undefined,
        deleteNpm: undefined,
        archiveName: undefined,
        additionalBuildPath: undefined,
    });
    const defaults = resolveArtifactsConfig({
        cwd: config.cwd,
        packageManager: { useYarn: false },
    });
    const resolved = resolveArtifactsConfig(options);

    expect(options.docker?.baseImage).toBeUndefined();
    expect(resolved.docker.baseImage).toBe(defaults.docker.baseImage);
    expect(resolved.docker.registry).toBe(defaults.docker.registry);
    expect(resolved.docker.runFromNonRootUser).toBe(defaults.docker.runFromNonRootUser);
    expect(resolved.docker.deleteNpm).toBe(defaults.docker.deleteNpm);
    expect(resolved.nginx.rootPath).toBe(defaults.nginx.rootPath);
    expect(resolved.nginx.baseConf).toBe(defaults.nginx.baseConf);
    expect(resolved.archive).toEqual(defaults.archive);
    expect(resolved.build.removeDevDependencies).toBe(defaults.build.removeDevDependencies);
    expect(resolveCommandOptions('archive-build', options)?.build?.removeDevDependencies).toBe(
        true,
    );
});
