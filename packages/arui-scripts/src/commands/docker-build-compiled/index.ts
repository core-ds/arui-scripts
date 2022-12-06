import fs from 'fs-extra';

import configs from '../../configs/app-configs';

import dockerfileTemplate from '../../templates/dockerfile-compiled.template';
import nginxConfTemplate from '../../templates/nginx.conf.template';
import startScript from '../../templates/start.template';
import exec from '../util/exec';
import { getBuildParamsFromArgs, prepareFilesForDocker } from '../util/docker-build';


(async () => {
    const { imageFullName, pathToTempDir, tempDirName } = getBuildParamsFromArgs();
    try {
        console.log(`Build docker image ${imageFullName}`);
        console.time('Total time');

        await prepareFilesForDocker({
            pathToTempDir,
            dockerfileTemplate,
            nginxConfTemplate,
            startScript,
            allowLocalDockerfile: false,
        });

        await exec(`docker build -f "./${tempDirName}/Dockerfile" \\
 --build-arg START_SH_LOCATION="./${tempDirName}/start.sh" \\
 --build-arg NGINX_CONF_LOCATION="./${tempDirName}/nginx.conf" -t ${imageFullName} .`);
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
