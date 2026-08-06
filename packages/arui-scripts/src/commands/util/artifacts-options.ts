import {
    type ArtifactsOptions,
    type DockerTemplateOverrides,
    resolveArtifactsConfig,
    type ResolvedArtifactsConfig,
} from '@alfalab/scripts-artifacts';

import { configs } from '../../configs/app-configs';
import { applyOverrides } from '../../configs/util/apply-overrides';

/**
 * Оверрайды шаблонов из `arui-scripts.overrides.ts`. Ключи в @alfalab/scripts-artifacts переименованы,
 * поэтому здесь мы явно транслируем их в исторические имена arui-scripts.
 *
 * Обратите внимание: в arui-scripts `nginx` — это server-блок (`nginx.conf`), а `nginxConf` —
 * базовый http-блок (`base-nginx.conf`). Имена исторически перепутаны, и эта таблица — единственное
 * место, где это знание нужно.
 */
const legacyTemplateOverrides: DockerTemplateOverrides = {
    dockerfile: (generated) => applyOverrides('Dockerfile', generated),
    dockerfileCompiled: (generated) => applyOverrides('DockerfileCompiled', generated),
    nginxConf: (generated) => applyOverrides('nginx', generated),
    baseNginxConf: (generated) => applyOverrides('nginxConf', generated),
    startScript: (generated) => applyOverrides('start.sh', generated),
};

/**
 * Транслирует глобальный конфиг arui-scripts в опции @alfalab/scripts-artifacts.
 *
 * Это единственная точка связи между двумя пакетами: сами шаблоны и утилиты сборки живут в
 * @alfalab/scripts-artifacts и ничего не знают про `configs`.
 */
export function getArtifactsOptions(
    extraOptions: Partial<ArtifactsOptions> = {},
): ArtifactsOptions {
    return {
        name: configs.name,
        version: configs.version,
        dockerRegistry: configs.dockerRegistry,

        baseDockerImage: configs.baseDockerImage,
        clientOnly: configs.clientOnly,
        buildPath: configs.buildPath,
        serverOutput: configs.serverOutput,
        nginxRootPath: configs.nginxRootPath,
        assetsPath: configs.assetsPath,
        publicPath: configs.publicPath,

        clientServerPort: configs.clientServerPort,
        serverPort: configs.serverPort,

        nginx: configs.nginx,
        enablePreviousVersionHeaders: configs.dictionaryCompression.enablePreviousVersionHeaders,

        runFromNonRootUser: configs.runFromNonRootUser,
        cwd: configs.cwd,
        debug: configs.debug,

        removeDevDependencies: configs.removeDevDependenciesDuringDockerBuild,

        archiveName: configs.archiveName,
        additionalBuildPath: configs.additionalBuildPath,

        useYarn: configs.useYarn,

        localFiles: {
            dockerfile: configs.localDockerfile,
            startScript: configs.localStartScript,
            nginxConf: configs.localNginxConf,
            nginxBaseConf: configs.localNginxBaseConf,
        },

        overrides: legacyTemplateOverrides,

        ...extraOptions,
    };
}

let cachedConfig: ResolvedArtifactsConfig | null = null;

/**
 * Донасыщенный конфиг сборки, построенный из `configs`. Мемоизирован, потому что резолв читает
 * package.json и версию yarn, а шаблоны вычисляются на уровне модуля.
 */
export function getResolvedArtifactsConfig(): ResolvedArtifactsConfig {
    if (!cachedConfig) {
        cachedConfig = resolveArtifactsConfig(getArtifactsOptions());
    }

    return cachedConfig;
}
