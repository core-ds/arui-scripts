import { renderNginxConf } from '@alfalab/scripts-artifacts';

import { getResolvedArtifactsConfig } from '../commands/util/artifacts-options';
import { applyOverrides } from '../configs/util/apply-overrides';

// исторически ключ оверрайда server-блока называется `nginx`, а `nginxConf` — это базовый конфиг
export const nginxConfTemplate = applyOverrides(
    'nginx',
    renderNginxConf(getResolvedArtifactsConfig()),
);
