import { renderBaseNginxConf } from '@alfalab/scripts-artifacts';

import { getResolvedArtifactsConfig } from '../commands/util/artifacts-options';
import { applyOverrides } from '../configs/util/apply-overrides';

// исторически ключ оверрайда базового конфига называется `nginxConf`
export const nginxBaseConfTemplate = applyOverrides(
    'nginxConf',
    renderBaseNginxConf(getResolvedArtifactsConfig()),
);
