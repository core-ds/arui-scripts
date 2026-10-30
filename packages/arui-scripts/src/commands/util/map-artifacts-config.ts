import { type ArtifactsConfigFile } from '@alfalab/arui-scripts-artifacts';

import { type AppContextWithConfigs } from '../../configs/app-configs/types';

/**
 * Постоянный адаптер конфигурации arui-scripts к API сборки артефактов.
 * Не читает файлы и глобальный configs; общие дефолты применяет resolveArtifactsConfig.
 * Особенности команд arui-scripts задаются здесь, независимо от standalone-конфига artifacts.
 */
export function mapArtifactsConfig(config: AppContextWithConfigs): ArtifactsConfigFile {
    return {
        name: config.name,
        version: config.version,
        cwd: config.cwd,
        debug: config.debug,

        clientOnly: config.clientOnly,
        buildPath: config.buildPath,
        serverOutput: config.serverOutput,
        serverPort: config.serverPort,
        assetsPath: config.assetsPath,
        publicPath: config.publicPath,

        docker: {
            registry: config.dockerRegistry,
            baseImage: config.baseDockerImage,
            runFromNonRootUser: config.runFromNonRootUser,
            deleteNpm: config.deleteNpm,
        },

        nginx: {
            port: config.clientServerPort,
            rootPath: config.nginxRootPath,
            enablePreviousVersionHeaders: config.dictionaryCompression.enablePreviousVersionHeaders,
            baseConf: config.nginx,
        },

        archive: {
            name: config.archiveName,
            additionalPaths: config.additionalBuildPath,
        },

        build: {
            removeDevDependencies: config.removeDevDependenciesDuringDockerBuild,
        },

        packageManager: {
            useYarn: config.useYarn,
        },

        localFiles: {
            dockerfile: config.localDockerfile,
            startScript: config.localStartScript,
            nginxConf: config.localNginxConf,
            nginxBaseConf: config.localNginxBaseConf,
        },

        commands: {
            'archive-build': {
                // archive-build исторически всегда удаляет dev-зависимости, независимо от
                // removeDevDependenciesDuringDockerBuild
                build: { removeDevDependencies: true },
            },
        },
    };
}
