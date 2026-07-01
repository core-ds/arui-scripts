import path from 'path';

import fs from 'fs-extra';

import {
    detectUseYarn,
    getInstallProductionCommand,
    getPruningCommand,
    getYarnVersion,
} from './utils/yarn';
import { DEFAULT_BASE_DOCKER_IMAGE, DEFAULT_TEMP_DIR_NAME } from './constants';
import { type DockerBuildOptions, type ResolvedDockerConfig } from './types';

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
export function resolveDockerConfig(options: DockerBuildOptions = {}): ResolvedDockerConfig {
    const cwd = options.cwd ?? process.cwd();
    const pkg = readPackageJson(cwd);

    const clientOnly = withDefault(options.clientOnly, false);
    const debug = withDefault(options.debug, false);

    const useYarn = withDefault(options.useYarn, detectUseYarn(cwd));
    const yarnVersion = options.yarnVersion ?? getYarnVersion({ useYarn });

    const nginx = options.nginx === false ? null : withDefault(options.nginx, null);

    const localFiles = {
        dockerfile: options.localFiles?.dockerfile ?? null,
        startScript: options.localFiles?.startScript ?? null,
        nginxConf: options.localFiles?.nginxConf ?? null,
        nginxBaseConf: options.localFiles?.nginxBaseConf ?? null,
    };

    return {
        name: options.name ?? pkg.name ?? '',
        version: options.version ?? pkg.version ?? '',
        dockerRegistry: withDefault(options.dockerRegistry, ''),

        baseDockerImage: withDefault(options.baseDockerImage, DEFAULT_BASE_DOCKER_IMAGE),
        clientOnly,
        buildPath: withDefault(options.buildPath, '.build'),
        serverOutput: withDefault(options.serverOutput, 'server.js'),
        nginxRootPath: withDefault(options.nginxRootPath, '/src'),
        publicPath: withDefault(options.publicPath, ''),

        clientServerPort: withDefault(options.clientServerPort, 8080),
        serverPort: withDefault(options.serverPort, 3000),

        nginx,
        enablePreviousVersionHeaders: withDefault(options.enablePreviousVersionHeaders, false),

        runFromNonRootUser: withDefault(options.runFromNonRootUser, true),
        cwd,
        context: withDefault(options.context, '.'),
        tempDirName: withDefault(options.tempDirName, DEFAULT_TEMP_DIR_NAME),
        debug,
        push: withDefault(options.push, !debug),
        platform: withDefault(options.platform, 'auto'),
        extraBuildArgs: withDefault(options.extraBuildArgs, {}),

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
