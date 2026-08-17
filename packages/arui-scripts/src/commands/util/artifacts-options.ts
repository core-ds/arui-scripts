import {
    type ArtifactsOptions,
    type ArtifactTemplateOverrides,
    resolveArtifactsConfig,
    type ResolvedArtifactsConfig,
} from '@alfalab/arui-scripts-artifacts';

import { configs } from '../../configs/app-configs';
import { applyOverrides } from '../../configs/util/apply-overrides';

import { warnAboutArtifactsDeprecations } from './artifacts-deprecations';

/**
 * Оверрайды шаблонов из `arui-scripts.overrides.ts`. Ключи в @alfalab/arui-scripts-artifacts переименованы,
 * поэтому здесь мы явно транслируем их в исторические имена arui-scripts.
 *
 * @deprecated Слой обратной совместимости: в следующей мажорной версии оверрайды шаблонов останутся
 * только в конфиге @alfalab/arui-scripts-artifacts (`overrides`).
 *
 * Обратите внимание: в arui-scripts `nginx` — это server-блок (`nginx.conf`), а `nginxConf` —
 * базовый http-блок (`base-nginx.conf`). Имена исторически перепутаны, и эта таблица — единственное
 * место, где это знание нужно.
 */
const legacyTemplateOverrides: ArtifactTemplateOverrides = {
    dockerfile: (generated) => applyOverrides('Dockerfile', generated),
    dockerfileCompiled: (generated) => applyOverrides('DockerfileCompiled', generated),
    nginxConf: (generated) => applyOverrides('nginx', generated),
    baseNginxConf: (generated) => applyOverrides('nginxConf', generated),
    startScript: (generated) => applyOverrides('start.sh', generated),
};

/**
 * Транслирует плоский конфиг arui-scripts в сгруппированные по доменам опции
 * @alfalab/arui-scripts-artifacts.
 *
 * Это единственная точка связи между двумя пакетами: сами шаблоны и утилиты сборки живут в
 * @alfalab/arui-scripts-artifacts и ничего не знают про `configs`.
 *
 * Здесь происходит только маппинг значений. Дефолты docker/nginx/archive-настроек не дублируются:
 * если пользователь ничего не задал, сюда приезжает `undefined` и значение подставит
 * `resolveArtifactsConfig`.
 *
 * @deprecated Сам маппинг — слой обратной совместимости. В следующей мажорной версии настройки
 * сборки артефактов будут жить только в конфиге @alfalab/arui-scripts-artifacts.
 */
export function getArtifactsOptions(extraOptions: ArtifactsOptions = {}): ArtifactsOptions {
    warnAboutArtifactsDeprecations();

    const options: ArtifactsOptions = {
        name: configs.name,
        version: configs.version,
        cwd: configs.cwd,
        debug: configs.debug,

        clientOnly: configs.clientOnly,
        buildPath: configs.buildPath,
        serverOutput: configs.serverOutput,
        serverPort: configs.serverPort,
        assetsPath: configs.assetsPath,
        publicPath: configs.publicPath,

        docker: {
            registry: configs.dockerRegistry,
            baseImage: configs.baseDockerImage,
            runFromNonRootUser: configs.runFromNonRootUser,
        },

        nginx: {
            port: configs.clientServerPort,
            rootPath: configs.nginxRootPath,
            enablePreviousVersionHeaders:
                configs.dictionaryCompression.enablePreviousVersionHeaders,
            baseConf: configs.nginx,
        },

        archive: {
            name: configs.archiveName,
            additionalPaths: configs.additionalBuildPath,
        },

        build: {
            removeDevDependencies: configs.removeDevDependenciesDuringDockerBuild,
        },

        packageManager: {
            useYarn: configs.useYarn,
        },

        localFiles: {
            dockerfile: configs.localDockerfile,
            startScript: configs.localStartScript,
            nginxConf: configs.localNginxConf,
            nginxBaseConf: configs.localNginxBaseConf,
        },

        overrides: legacyTemplateOverrides,
    };

    // секции сливаем по полям: команда донасыщает то, что уже смаплено из configs
    return {
        ...options,
        ...extraOptions,
        docker: { ...options.docker, ...extraOptions.docker },
        nginx: { ...options.nginx, ...extraOptions.nginx },
        archive: { ...options.archive, ...extraOptions.archive },
        build: { ...options.build, ...extraOptions.build },
        packageManager: { ...options.packageManager, ...extraOptions.packageManager },
        localFiles: { ...options.localFiles, ...extraOptions.localFiles },
    };
}

let cachedConfig: ResolvedArtifactsConfig | null = null;

/**
 * Донасыщенный конфиг сборки, построенный из `configs`. Мемоизирован, потому что резолв читает
 * package.json и версию yarn.
 */
export function getResolvedArtifactsConfig(): ResolvedArtifactsConfig {
    if (!cachedConfig) {
        cachedConfig = resolveArtifactsConfig(getArtifactsOptions());
    }

    return cachedConfig;
}
