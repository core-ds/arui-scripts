import path from 'path';

import fs from 'fs-extra';

import {
    detectUseYarn,
    getInstallProductionCommand,
    getPruningCommand,
    getYarnVersion,
} from './utils/yarn';
import {
    DEFAULT_ARCHIVE_NAME,
    DEFAULT_ARCHIVE_TEMP_DIR_NAME,
    DEFAULT_BASE_DOCKER_IMAGE,
    DEFAULT_TEMP_DIR_NAME,
} from './constants';
import { type ArtifactsOptions, type ResolvedArtifactsConfig } from './types';

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
 * Значения по умолчанию совпадают с историческим поведением arui-scripts, поэтому вызов без
 * аргументов даст такой же образ, как команда `arui-scripts docker-build`.
 */
export function resolveArtifactsConfig(options: ArtifactsOptions = {}): ResolvedArtifactsConfig {
    const cwd = options.cwd ?? process.cwd();
    const pkg = readPackageJson(cwd);

    const artifact = withDefault(options.artifact, 'docker');
    const variant = withDefault(options.variant, 'runtime');
    // архив всегда собирается на хосте — внутри tar-а собирать нечего
    const isRuntime = artifact === 'archive' || variant === 'runtime';

    const clientOnly = withDefault(options.clientOnly, false);
    const debug = withDefault(options.debug, false);

    const useYarn = withDefault(options.useYarn, detectUseYarn(cwd));
    const yarnVersion = options.yarnVersion ?? getYarnVersion({ useYarn });

    const nginx = options.nginx === false ? null : withDefault(options.nginx, null);

    const assetsPath = withDefault(options.assetsPath, 'assets');
    // arui-scripts считает publicPath как `${assetsPath}/`. Пустой publicPath дал бы второй
    // `location /` в nginx-конфиге и nginx не поднялся бы с `duplicate location "/"`.
    const publicPath = withDefault(options.publicPath, `${assetsPath}/`);

    const buildCommand = withDefault(options.buildCommand, isRuntime ? 'npm run build' : null);

    const localFiles = {
        dockerfile: options.localFiles?.dockerfile ?? null,
        startScript: options.localFiles?.startScript ?? null,
        nginxConf: options.localFiles?.nginxConf ?? null,
        nginxBaseConf: options.localFiles?.nginxBaseConf ?? null,
    };

    return {
        artifact,
        variant,

        name: options.name ?? pkg.name ?? '',
        version: options.version ?? pkg.version ?? '',
        dockerRegistry: withDefault(options.dockerRegistry, ''),

        baseDockerImage: withDefault(options.baseDockerImage, DEFAULT_BASE_DOCKER_IMAGE),
        clientOnly,
        buildPath: withDefault(options.buildPath, '.build'),
        serverOutput: withDefault(options.serverOutput, 'server.js'),
        nginxRootPath: withDefault(options.nginxRootPath, '/src'),
        assetsPath,
        publicPath,

        clientServerPort: withDefault(options.clientServerPort, 8080),
        serverPort: withDefault(options.serverPort, 3000),

        nginx,
        enablePreviousVersionHeaders: withDefault(options.enablePreviousVersionHeaders, false),

        runFromNonRootUser: withDefault(options.runFromNonRootUser, true),
        cwd,
        context: withDefault(options.context, '.'),
        tempDirName: withDefault(
            options.tempDirName,
            artifact === 'archive' ? DEFAULT_ARCHIVE_TEMP_DIR_NAME : DEFAULT_TEMP_DIR_NAME,
        ),
        debug,
        push: withDefault(options.push, !debug),
        platform: withDefault(options.platform, 'auto'),
        extraBuildArgs: withDefault(options.extraBuildArgs, {}),

        cleanBuildPath: withDefault(options.cleanBuildPath, isRuntime),
        buildCommand: buildCommand || null,
        removeDevDependencies: withDefault(options.removeDevDependencies, isRuntime),

        archiveName: withDefault(options.archiveName, DEFAULT_ARCHIVE_NAME),
        additionalBuildPath: withDefault(options.additionalBuildPath, ['config']),

        useYarn,
        yarnVersion,
        installProductionCommand:
            options.installProductionCommand ?? getInstallProductionCommand(yarnVersion),
        pruneCommand: options.pruneCommand ?? getPruningCommand({ yarnVersion, clientOnly }),

        addNodeModulesToDockerIgnore: withDefault(options.addNodeModulesToDockerIgnore, false),
        allowLocalDockerfile: withDefault(options.allowLocalDockerfile, true),
        allowLocalStartScript: withDefault(options.allowLocalStartScript, true),
        localFiles,
    };
}
