import fs from 'fs-extra';

import configs from '../../configs/app-configs';
import nginxBaseConfTemplate from '../../templates/base-nginx.conf.template';
import dockerfileTemplate from '../../templates/dockerfile.template';
import nginxConfTemplate from '../../templates/nginx.conf.template';
import startScript from '../../templates/start.template';
import {
    getBuildParamsFromArgs,
    getDockerBuildCommand,
    prepareFilesForDocker,
} from '../util/docker-build';
import exec from '../util/exec';
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
            nginxBaseConfTemplate,
            startScriptTemplate: startScript,
            allowLocalDockerfile: true,
            allowLocalStartScript: true,
            addNodeModulesToDockerIgnore: false,
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

        await exec(getDockerBuildCommand({ tempDirName, imageFullName }));

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
