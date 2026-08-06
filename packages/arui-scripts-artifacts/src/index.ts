/**
 * Публичное API пакета. Реэкспортит доменные модули: конфиг, общий пайплайн и по одному модулю на
 * тип артефакта (`docker`, `archive`) и на файлы, которые в них кладутся (`nginx`, `start-script`).
 */

/* Конфиг */
export { resolveArtifactsConfig } from './config';
export type {
    ArchiveOptions,
    ArtifactKind,
    ArtifactsOptions,
    ArtifactTemplateOverrides,
    ArtifactTemplates,
    BuildOptions,
    DockerfileVariant,
    DockerOptions,
    DockerPlatform,
    LocalFilesOptions,
    NginxBaseConfOptions,
    NginxOptions,
    PackageManagerOptions,
    RenderedTemplates,
    ResolvedArchiveConfig,
    ResolvedArtifactsConfig,
    ResolvedBuildConfig,
    ResolvedDockerConfig,
    ResolvedLocalFilesConfig,
    ResolvedNginxBaseConf,
    ResolvedNginxConfig,
    ResolvedPackageManagerConfig,
    TemplateKey,
    TemplateOverride,
    TemplateRenderer,
    YarnVersion,
} from './config/types';

/* Общий пайплайн сборки артефакта */
export * from './pipeline';

/* Артефакты */
export * from './docker';
export * from './archive';

/* Файлы, которые кладутся в артефакт */
export * from './nginx';
export * from './start-script';

/* CLI и файл конфига */
export * from './cli';

/* Утилиты */
export { exec, ExecError } from './utils/exec';
export { shellQuote } from './utils/shell';
export {
    detectUseYarn,
    getInstallProductionCommand,
    getPruningCommand,
    getYarnVersion,
} from './utils/yarn';
