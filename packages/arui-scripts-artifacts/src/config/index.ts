import path from 'path';

import fs from 'fs-extra';

import {
    DEFAULT_ARCHIVE_ADDITIONAL_PATHS,
    DEFAULT_ARCHIVE_NAME,
    DEFAULT_ARCHIVE_TEMP_DIR_NAME,
} from '../archive/constants';
import { DEFAULT_BASE_DOCKER_IMAGE, DEFAULT_TEMP_DIR_NAME } from '../docker/constants';
import {
    DEFAULT_NGINX_BASE_CONF,
    DEFAULT_NGINX_PORT,
    DEFAULT_NGINX_ROOT_PATH,
} from '../nginx/constants';
import {
    detectUseYarn,
    getInstallProductionCommand,
    getPruningCommand,
    getYarnVersion,
} from '../utils/yarn';

import {
    type ArtifactsOptions,
    type ResolvedArchiveConfig,
    type ResolvedArtifactsConfig,
    type ResolvedBuildConfig,
    type ResolvedDockerConfig,
    type ResolvedLocalFilesConfig,
    type ResolvedNginxConfig,
    type ResolvedPackageManagerConfig,
} from './types';

function readPackageJson(cwd: string): { name?: string; version?: string } {
    try {
        return fs.readJsonSync(path.join(cwd, 'package.json'));
    } catch {
        return {};
    }
}

/**
 * Дефолт значения флага `undefined ? fallback : value`, но с учетом того, что `false`/`0`/`''`
 * — валидные значения, которые не должны затираться дефолтом.
 */
function withDefault<T>(value: T | undefined, fallback: T): T {
    return value === undefined ? fallback : value;
}

/**
 * Донасыщает частичные опции сборки полным набором значений с дефолтами.
 *
 * Все дефолты артефактов живут здесь (и в константах доменных папок) — потребители, включая
 * arui-scripts, только транслируют то, что задал пользователь. Значения по умолчанию совпадают с
 * историческим поведением arui-scripts, поэтому вызов без аргументов даст такой же образ, как
 * команда `arui-scripts docker-build`.
 */
export function resolveArtifactsConfig(options: ArtifactsOptions = {}): ResolvedArtifactsConfig {
    const cwd = options.cwd ?? process.cwd();
    const pkg = readPackageJson(cwd);

    const artifact = withDefault(options.artifact, 'docker');
    const clientOnly = withDefault(options.clientOnly, false);
    const debug = withDefault(options.debug, false);
    const buildPath = withDefault(options.buildPath, '.build');
    const assetsPath = withDefault(options.assetsPath, 'assets');

    return {
        artifact,

        name: options.name ?? pkg.name ?? '',
        version: options.version ?? pkg.version ?? '',
        cwd,
        debug,

        clientOnly,
        buildPath,
        serverOutput: withDefault(options.serverOutput, 'server.js'),
        serverPort: withDefault(options.serverPort, 3000),
        assetsPath,
        // arui-scripts считает publicPath как `${assetsPath}/`. Пустой publicPath дал бы второй
        // `location /` в nginx-конфиге и nginx не поднялся бы с `duplicate location "/"`.
        publicPath: withDefault(options.publicPath, `${assetsPath}/`),

        docker: resolveDocker(options, debug),
        nginx: resolveNginx(options),
        archive: resolveArchive(options),
        build: resolveBuild(options, artifact),
        packageManager: resolvePackageManager(options, cwd, clientOnly),
        localFiles: resolveLocalFiles(options),
    };
}

function resolveDocker(options: ArtifactsOptions, debug: boolean): ResolvedDockerConfig {
    const docker = options.docker ?? {};

    return {
        variant: withDefault(docker.variant, 'runtime'),
        registry: withDefault(docker.registry, ''),
        baseImage: withDefault(docker.baseImage, DEFAULT_BASE_DOCKER_IMAGE),
        runFromNonRootUser: withDefault(docker.runFromNonRootUser, true),
        context: withDefault(docker.context, '.'),
        tempDirName: withDefault(docker.tempDirName, DEFAULT_TEMP_DIR_NAME),
        push: withDefault(docker.push, !debug),
        platform: withDefault(docker.platform, 'auto'),
        buildArgs: withDefault(docker.buildArgs, {}),
        addNodeModulesToDockerIgnore: withDefault(docker.addNodeModulesToDockerIgnore, false),
    };
}

function resolveNginx(options: ArtifactsOptions): ResolvedNginxConfig {
    const nginx = options.nginx ?? {};
    // `false` — то же самое, что `null`: базовый конфиг не генерируется
    const baseConf = nginx.baseConf || null;

    return {
        port: withDefault(nginx.port, DEFAULT_NGINX_PORT),
        rootPath: withDefault(nginx.rootPath, DEFAULT_NGINX_ROOT_PATH),
        enablePreviousVersionHeaders: withDefault(nginx.enablePreviousVersionHeaders, false),
        baseConf: baseConf && { ...DEFAULT_NGINX_BASE_CONF, ...baseConf },
    };
}

function resolveArchive(options: ArtifactsOptions): ResolvedArchiveConfig {
    const archive = options.archive ?? {};

    return {
        name: withDefault(archive.name, DEFAULT_ARCHIVE_NAME),
        tempDirName: withDefault(archive.tempDirName, DEFAULT_ARCHIVE_TEMP_DIR_NAME),
        additionalPaths: withDefault(archive.additionalPaths, DEFAULT_ARCHIVE_ADDITIONAL_PATHS),
    };
}

function resolveBuild(
    options: ArtifactsOptions,
    artifact: ResolvedArtifactsConfig['artifact'],
): ResolvedBuildConfig {
    const build = options.build ?? {};
    // архив всегда собирается на хосте — внутри tar-а собирать нечего
    const isHostBuild =
        artifact === 'archive' || withDefault(options.docker?.variant, 'runtime') === 'runtime';
    const command = withDefault(build.command, isHostBuild ? 'npm run build' : null);

    return {
        cleanBuildPath: withDefault(build.cleanBuildPath, isHostBuild),
        command: command || null,
        removeDevDependencies: withDefault(build.removeDevDependencies, isHostBuild),
    };
}

function resolvePackageManager(
    options: ArtifactsOptions,
    cwd: string,
    clientOnly: boolean,
): ResolvedPackageManagerConfig {
    const packageManager = options.packageManager ?? {};
    const useYarn = withDefault(packageManager.useYarn, detectUseYarn(cwd));
    const yarnVersion = packageManager.yarnVersion ?? getYarnVersion({ useYarn });

    return {
        useYarn,
        yarnVersion,
        installProductionCommand:
            packageManager.installProductionCommand ?? getInstallProductionCommand(yarnVersion),
        pruneCommand: packageManager.pruneCommand ?? getPruningCommand({ yarnVersion, clientOnly }),
    };
}

function resolveLocalFiles(options: ArtifactsOptions): ResolvedLocalFilesConfig {
    const localFiles = options.localFiles ?? {};

    return {
        dockerfile: localFiles.dockerfile ?? null,
        startScript: localFiles.startScript ?? null,
        nginxConf: localFiles.nginxConf ?? null,
        nginxBaseConf: localFiles.nginxBaseConf ?? null,
        allowDockerfile: withDefault(localFiles.allowDockerfile, true),
        allowStartScript: withDefault(localFiles.allowStartScript, true),
    };
}
