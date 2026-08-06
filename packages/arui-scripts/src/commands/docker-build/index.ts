import { buildDockerImage } from '@alfalab/scripts-artifacts';

import { getArtifactsOptions } from '../util/artifacts-options';

(async () => {
    try {
        await buildDockerImage({
            ...getArtifactsOptions(),
            variant: 'runtime',
            allowLocalDockerfile: true,
            allowLocalStartScript: true,
            addNodeModulesToDockerIgnore: false,
            argv: process.argv.slice(3),
        });
    } catch {
        // buildDockerImage уже напечатал ошибку (и стек, если включен debug)
        process.exit(1);
    }
})();
