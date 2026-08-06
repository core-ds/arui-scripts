import { renderDockerfile } from '@alfalab/scripts-artifacts';

import { getResolvedArtifactsConfig } from '../commands/util/artifacts-options';
import { applyOverrides } from '../configs/util/apply-overrides';

export const dockerfileTemplate = applyOverrides(
    'Dockerfile',
    renderDockerfile(getResolvedArtifactsConfig()),
);
