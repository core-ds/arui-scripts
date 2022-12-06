
import fs from 'fs-extra';

import configs from '../../configs/app-configs';

import dockerfileTemplate from '../../templates/dockerfile.template';
import nginxConfTemplate from '../../templates/nginx.conf.template';
import startScript from '../../templates/start.template';
import exec from '../util/exec';
import { getBuildParamsFromArgs, prepareFilesForDocker } from '../util/docker-build';
import { getPruningCommand } from '../util/yarn';

(async () => {
    const { imageFullName, pathToTempDir, tempDirName } = getBuildParamsFromArgs();
    try {
        console.log(`Build docker image ${imageFullName}`);
        console.time('Total time');
        console.time('Setting up time');

        await prepareFilesForDocker({
            pathToTempDir,
            dockerfileTemplate,
            nginxConfTemplate,
            startScript,
            allowLocalDockerfile: true,
        });

        await fs.remove(configs.buildPath);

        console.timeEnd('Setting up time');
        console.time('Build application time');
        // run build script
        await exec('npm run build');

        console.timeEnd('Build application time');

        if (configs.removeDevDependenciesDuringDockerBuild) {
            console.time('Remove dev dependencies time');

            const pruneCommand = getPruningCommand();
            await exec(pruneCommand);

            console.timeEnd('Remove dev dependencies time');
        }


        console.time('Build docker image time');
        await exec(`docker build -f "./${tempDirName}/Dockerfile" \\
 --build-arg START_SH_LOCATION="./${tempDirName}/start.sh" \\
 --build-arg NGINX_CONF_LOCATION="./${tempDirName}/nginx.conf" -t ${imageFullName} .`);

        console.timeEnd('Build docker image time');
        console.time('Cleanup time');

        // remove temp directory
        await fs.remove(pathToTempDir);

        // guard against pushing the image during tests
        if (!configs.debug) {
            await exec(`docker push ${imageFullName}`);
        }

        console.timeEnd('Cleanup time');
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
