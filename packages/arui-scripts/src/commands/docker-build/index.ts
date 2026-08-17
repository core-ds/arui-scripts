import { buildDockerImage } from '@alfalab/arui-scripts-artifacts';

import { getArtifactsOptions } from '../util/artifacts-options';

(async () => {
    try {
        await buildDockerImage({
            ...getArtifactsOptions({
                docker: { variant: 'runtime', addNodeModulesToDockerIgnore: false },
                localFiles: { allowDockerfile: true, allowStartScript: true },
            }),
            argv: process.argv.slice(3),
        });
    } catch {
        // buildDockerImage уже напечатал ошибку (и стек, если включен debug)
        process.exit(1);
    }
})();
