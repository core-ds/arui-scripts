import fs from 'fs-extra';

import configs from '../../configs/app-configs';
import dockerfileTemplate from '../../templates/dockerfile-compiled.template';
import nginxConfTemplate from '../../templates/nginx.conf.template';
import startScript from '../../templates/start.template';
import {
    getBuildParamsFromArgs,
    getDockerBuildCommand,
    prepareFilesForDocker,
} from '../util/docker-build';
import exec from '../util/exec';

(async () => {
    const { imageFullName, pathToTempDir, tempDirName } = getBuildParamsFromArgs();

    try {
        console.log(`Build docker image ${imageFullName}`);
        console.time('Total time');

        await prepareFilesForDocker({
            pathToTempDir,
            dockerfileTemplate,
            nginxConfTemplate,
            startScriptTemplate: startScript,
            allowLocalDockerfile: false,
            allowLocalStartScript: false,
        });

        await exec('echo "node_modules" >> .dockerignore');

        await exec(getDockerBuildCommand({ tempDirName, imageFullName }));
        await fs.remove(pathToTempDir);

        // guard against pushing the image during tests
        if (!configs.debug) {
            await exec(`docker push ${imageFullName}`);
        }

        console.timeEnd('Total time');
    } catch (err) {
        await fs.remove(pathToTempDir);
        console.error('Error during docker-build.');
        if (configs.debug) {
            console.error(err);
        }
        process.exit(1);
    }
})();
