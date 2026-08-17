export type { OverrideFile } from './configs/util/apply-overrides';

export type { AppConfigs, CompatModuleConfig, PackageSettings } from './configs/app-configs/types';

/**
 * Утилиты сборки docker-образа, привязанные к глобальному конфигу arui-scripts.
 * @deprecated Используйте `@alfalab/arui-scripts-artifacts` — там те же функции принимают явный конфиг.
 * В следующей мажорной версии эти реэкспорты будут удалены.
 */
export { prepareFilesForDocker } from './commands/util/docker-build';
export { getBuildParamsFromArgs } from './commands/util/docker-build';
export { getDockerBuildCommand } from './commands/util/docker-build';

/**
 * Опции сборки docker-образа, собранные из конфига arui-scripts. Точка входа для тех, кто хочет
 * собрать образ через `@alfalab/arui-scripts-artifacts`, но переиспользовать настройки arui-scripts.
 * @deprecated Слой обратной совместимости: в следующей мажорной версии настройки сборки артефактов
 * будут жить только в конфиге `arui-scripts-artifacts.ts`.
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
    type ArtifactTemplateOverrides,
    type ArtifactTemplates,
    type ResolvedArtifactsConfig,
} from '@alfalab/arui-scripts-artifacts';

export { patchMainWebpackConfigForModules } from './configs/modules';
