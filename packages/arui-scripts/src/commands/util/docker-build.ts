import path from 'path';

import fs from 'fs-extra';
import satisfies from 'semver/functions/satisfies';
import shell from 'shelljs';

import configs from '../../configs/app-configs';

export function getBuildParamsFromArgs() {
    let imageVersion = configs.version;
    let imageName = configs.name;
    let { dockerRegistry } = configs;
    const commandLineArguments = process.argv.slice(3);

    commandLineArguments.forEach((arg) => {
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
    const imageFullName = `${
        dockerRegistry ? `${dockerRegistry}/` : ''
    }${imageName}:${imageVersion}`;

    return {
        pathToTempDir,
        imageFullName,
        tempDirName,
    };
}

type PrepareFilesForDockerParams = {
    dockerfileTemplate: string;
    nginxConfTemplate: string;
    startScriptTemplate: string;
    pathToTempDir: string;
    allowLocalDockerfile: boolean;
    allowLocalStartScript: boolean;
    addNodeModulesToDockerIgnore: boolean;
};

export async function prepareFilesForDocker({
    dockerfileTemplate,
    nginxConfTemplate,
    startScriptTemplate,
    pathToTempDir,
    allowLocalDockerfile,
    allowLocalStartScript,
    addNodeModulesToDockerIgnore,
}: PrepareFilesForDockerParams) {
    await fs.emptyDir(pathToTempDir);

    const nginxConf = configs.localNginxConf
        ? await fs.readFile(configs.localNginxConf, 'utf8')
        : nginxConfTemplate;

    const dockerfile =
        configs.localDockerfile && allowLocalDockerfile
            ? await fs.readFile(configs.localDockerfile, 'utf8')
            : dockerfileTemplate;

    const startScript =
        configs.localStartScript && allowLocalStartScript
            ? await fs.readFile(configs.localStartScript, 'utf8')
            : startScriptTemplate;

    const dockerIgnoreFilePath = path.join(process.cwd(), '.dockerignore');

    const dockerIgnoreFileContent =
        addNodeModulesToDockerIgnore &&
        (await getAndModifyDockerIgnoreContent(dockerIgnoreFilePath));

    await Promise.all([
        fs.writeFile(path.join(pathToTempDir, 'Dockerfile'), dockerfile, 'utf8'),
        fs.writeFile(path.join(pathToTempDir, 'nginx.conf'), nginxConf, 'utf8'),
        fs.writeFile(path.join(pathToTempDir, 'start.sh'), startScript, {
            encoding: 'utf8',
            mode: 0o555,
        }),
        addNodeModulesToDockerIgnore &&
            dockerIgnoreFileContent &&
            fs.writeFile(dockerIgnoreFilePath, dockerIgnoreFileContent, 'utf-8'),
    ]);
}

export function dockerVersionSatisfies(request: string) {
    const dockerServerVersion = shell.exec("docker version --format '{{.Server.Version}}'", {
        silent: true,
    });
    const dockerClientVersion = shell.exec("docker version --format '{{.Client.Version}}'", {
        silent: true,
    });

    return satisfies(dockerServerVersion.toString(), request) && satisfies(dockerClientVersion.toString(), request);
}

type DockerBuildCommandParams = {
    tempDirName: string;
    imageFullName: string;
};

export function getDockerBuildCommand({ tempDirName, imageFullName }: DockerBuildCommandParams) {
    // если пытаться собрать проект на маках с m1, докер будет пытаться вытянуть базовый образ под свою платформу и
    // упадет с ошибкой. Чтобы этого избежать - достаточно использовать флаг --platform. Но он поддерживается без экспериментальных
    // флагов только начиная с docker 20.10.21, а на многих серверах, используемых для сборки до сих пор живет докер 1.13.1
    // Соответственно они будут падать при наличии этого флага.
    // https://docs.docker.com/engine/release-notes/20.10/
    const canUsePlatformFlag = dockerVersionSatisfies('>=20.10.21');

    return `docker build ${
        canUsePlatformFlag ? '--platform linux/x86_64' : ''
    } -f "./${tempDirName}/Dockerfile" --build-arg START_SH_LOCATION="./${tempDirName}/start.sh" --build-arg NGINX_CONF_LOCATION="./${tempDirName}/nginx.conf" -t ${imageFullName} .`;
}

async function getAndModifyDockerIgnoreContent(dockerIgnoreFilePath: string) {
    if (fs.existsSync(dockerIgnoreFilePath)) {
        return fs
            .readFile(dockerIgnoreFilePath, 'utf-8')
            .then((ignores) => `${ignores}\nnode_modules`);
    }

    await fs.createFile(dockerIgnoreFilePath);

    return 'node_modules';
}
