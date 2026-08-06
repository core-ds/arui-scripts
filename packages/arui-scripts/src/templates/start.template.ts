import { renderStartScript } from '@alfalab/scripts-artifacts';

import { getResolvedArtifactsConfig } from '../commands/util/artifacts-options';
import { applyOverrides } from '../configs/util/apply-overrides';

export const startScript = applyOverrides(
    'start.sh',
    renderStartScript(getResolvedArtifactsConfig()),
);
