import { renderDockerfileCompiled } from '@alfalab/scripts-artifacts';

import { getResolvedArtifactsConfig } from '../commands/util/artifacts-options';
import { applyOverrides } from '../configs/util/apply-overrides';

export const dockerfileTemplate = applyOverrides(
    'DockerfileCompiled',
    renderDockerfileCompiled(getResolvedArtifactsConfig()),
);
