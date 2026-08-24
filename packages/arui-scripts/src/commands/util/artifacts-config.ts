import {
    type ArtifactsConfigFile,
    type ArtifactTemplateOverrides,
    mergeConfigFiles,
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
 * Собирает из плоского конфига arui-scripts полноценный конфиг @alfalab/arui-scripts-artifacts —
 * ровно в той же форме, в какой его пишут руками в `arui-scripts-artifacts.ts` в корне проекта: на
 * верхнем уровне общее для всех сборок, в `commands` — то, чем конкретная команда отличается.
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
export function getArtifactsOptions(extraOptions: ArtifactsConfigFile = {}): ArtifactsConfigFile {
    warnAboutArtifactsDeprecations();

    const options: ArtifactsConfigFile = {
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

        commands: {
            'archive-build': {
                // archive-build исторически всегда удаляет dev-зависимости, независимо от
                // removeDevDependenciesDuringDockerBuild
                build: { removeDevDependencies: true },
            },
        },
    };

    // сливаем по тем же правилам, что и сам файл конфига: секции по полям, `commands` по имени
    return mergeConfigFiles(options, extraOptions);
}

let cachedConfig: ResolvedArtifactsConfig | null = null;

/**
 * Донасыщенный конфиг сборки, построенный из `configs`. Мемоизирован, потому что резолв читает
 * package.json и версию yarn.
 *
 * Резолвится только верхний уровень: командные секции разбирает CLI, когда знает, какую команду
 * запустили.
 */
export function getResolvedArtifactsConfig(): ResolvedArtifactsConfig {
    if (!cachedConfig) {
        const { commands, ...sharedOptions } = getArtifactsOptions();

        cachedConfig = resolveArtifactsConfig(sharedOptions);
    }

    return cachedConfig;
}
