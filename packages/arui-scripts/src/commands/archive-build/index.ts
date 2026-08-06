import { buildArchive } from '@alfalab/scripts-artifacts';

import { getArtifactsOptions } from '../util/artifacts-options';

(async () => {
    try {
        await buildArchive(
            getArtifactsOptions({
                // archive-build исторически всегда удаляет dev-зависимости, независимо от
                // removeDevDependenciesDuringDockerBuild
                build: { removeDevDependencies: true },
            }),
        );
    } catch {
        // buildArchive уже напечатал ошибку (и стек, если включен debug)
        process.exit(1);
    }
})();
