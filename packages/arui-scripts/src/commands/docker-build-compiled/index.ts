import { buildDockerImage } from '@alfalab/scripts-artifacts';

import { getArtifactsOptions } from '../util/artifacts-options';

(async () => {
    try {
        await buildDockerImage({
            ...getArtifactsOptions(),
            variant: 'compiled',
            allowLocalDockerfile: false,
            allowLocalStartScript: false,
            addNodeModulesToDockerIgnore: true,
            argv: process.argv.slice(3),
        });
    } catch {
        // buildDockerImage уже напечатал ошибку (и стек, если включен debug)
        process.exit(1);
    }
})();
