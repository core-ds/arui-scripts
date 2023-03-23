import configs from '../../configs/app-configs';
import path from 'path';
import fs from 'fs-extra';

export function getBuildParamsFromArgs() {
    let imageVersion = configs.version;
    let imageName = configs.name;
    let dockerRegistry = configs.dockerRegistry;
    const commandLineArguments = process.argv.slice(3);

    commandLineArguments.forEach(arg => {
        let [argName, argValue] = arg.split('=');
        argName = argName.toLowerCase().trim();
        argValue = argValue ? argValue.trim() : '';
        switch (argName) {
            case 'version':
                imageVersion = argValue;
                break;
            case 'name':
                imageName = argValue;
                break;
            case 'registry':
                dockerRegistry = argValue;
                break;
            default:
                console.warn(`Unknown argument ${argName}`);
        }
    });

    const tempDirName = '.docker-build';
    const pathToTempDir = path.join(configs.cwd, tempDirName);
    const imageFullName = `${dockerRegistry ? `${dockerRegistry}/` : ''}${imageName}:${imageVersion}`;

    return {
        pathToTempDir,
        imageFullName,
        tempDirName,
    }
}

type PrepareFilesForDockerParams = {
    dockerfileTemplate: string;
    nginxConfTemplate: string;
    startScriptTemplate: string;
    pathToTempDir: string;
    allowLocalDockerfile: boolean;
    allowLocalStartScript: boolean;
}

export async function prepareFilesForDocker({
    dockerfileTemplate,
    nginxConfTemplate,
    startScriptTemplate,
    pathToTempDir,
    allowLocalDockerfile,
    allowLocalStartScript
}: PrepareFilesForDockerParams) {
    await fs.emptyDir(pathToTempDir);

    const nginxConf = configs.localNginxConf
        ? await fs.readFile(configs.localNginxConf, 'utf8')
        : nginxConfTemplate;

    const dockerfile = configs.localDockerfile && allowLocalDockerfile
        ? await fs.readFile(configs.localDockerfile, 'utf8')
        : dockerfileTemplate;

    const startScript = configs.localStartScript && allowLocalStartScript
        ? await fs.readFile(configs.localStartScript, 'utf8')
        : startScriptTemplate;

    await Promise.all([
        fs.writeFile(path.join(pathToTempDir, 'Dockerfile'), dockerfile, 'utf8'),
        fs.writeFile(path.join(pathToTempDir, 'nginx.conf'), nginxConf, 'utf8'),
        fs.writeFile(path.join(pathToTempDir, 'start.sh'), startScript, { encoding: 'utf8', mode: 0o555 }),
    ]);
}
