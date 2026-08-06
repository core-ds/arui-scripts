export type { OverrideFile } from './configs/util/apply-overrides';

export type { AppConfigs, CompatModuleConfig, PackageSettings } from './configs/app-configs/types';

/**
 * Утилиты сборки docker-образа, привязанные к глобальному конфигу arui-scripts.
 * @deprecated Используйте `@alfalab/scripts-artifacts` — там те же функции принимают явный конфиг.
 */
export { prepareFilesForDocker } from './commands/util/docker-build';
export { getBuildParamsFromArgs } from './commands/util/docker-build';
export { getDockerBuildCommand } from './commands/util/docker-build';

/**
 * Опции сборки docker-образа, собранные из конфига arui-scripts. Точка входа для тех, кто хочет
 * собрать образ через `@alfalab/scripts-artifacts`, но переиспользовать настройки arui-scripts.
 */
export { getArtifactsOptions, getResolvedArtifactsConfig } from './commands/util/artifacts-options';

export {
    buildDockerImage,
    getBuildParams,
    renderBaseNginxConf,
    renderDockerfile,
    renderDockerfileCompiled,
    renderTemplates,
    renderNginxConf,
    renderStartScript,
    resolveArtifactsConfig,
    type ArtifactsOptions,
    type DockerTemplateOverrides,
    type DockerTemplates,
    type ResolvedArtifactsConfig,
} from '@alfalab/scripts-artifacts';

export { patchMainWebpackConfigForModules } from './configs/modules';
