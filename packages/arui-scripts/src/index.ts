export type { OverrideFile } from './configs/util/apply-overrides';

export type { AppConfigs, CompatModuleConfig, PackageSettings } from './configs/app-configs/types';

/**
 * Утилиты сборки docker-образа, привязанные к глобальному конфигу arui-scripts.
 */
export { prepareFilesForDocker } from './commands/util/docker-build';
export { getBuildParamsFromArgs } from './commands/util/docker-build';
export { getDockerBuildCommand } from './commands/util/docker-build';

/**
 * Опции и разрешённая конфигурация сборки артефактов из настроек arui-scripts.
 */
export { getArtifactsOptions, getResolvedArtifactsConfig } from './commands/util/artifacts-config';

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
    type ArtifactTemplateOverrides,
    type ArtifactTemplates,
    type ResolvedArtifactsConfig,
} from '@alfalab/arui-scripts-artifacts';

export { patchMainRspackConfigForModules } from './configs/modules';
