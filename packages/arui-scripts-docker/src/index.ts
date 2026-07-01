export * from './types';
export * from './constants';

export { resolveDockerConfig } from './config';
export { buildDockerImage, type BuildDockerImageOptions } from './build-docker-image';
export {
    renderDockerTemplates,
    type DockerfileVariant,
    type RenderDockerTemplatesParams,
} from './render';

export {
    renderDockerfile,
    renderDockerfileCompiled,
    renderNginxConf,
    renderBaseNginxConf,
    renderStartScript,
} from './templates';

export {
    applyCommandLineArguments,
    dockerVersionSatisfies,
    getBuildParams,
    getBuildParamsFromArgs,
    getDockerBuildCommand,
    getPlatformFlag,
    prepareFilesForDocker,
    type BuildParams,
} from './utils/docker-build';

export { exec } from './utils/exec';
export {
    detectUseYarn,
    getInstallProductionCommand,
    getPruningCommand,
    getYarnVersion,
} from './utils/yarn';
