#! /usr/bin/env node
import path from 'path';

import fs from 'fs-extra';

import { resolveCommandOptions } from '../cli/config-file';
import { createCli, extractConfigPath } from '../cli/create-cli';
import { resolveConfigFile } from '../cli/load-config-file';
import { type LocalFilesOptions } from '../config/types';
import { DOCKERFILE_FILENAME } from '../docker/constants';
import { BASE_NGINX_CONFIG_FILENAME, NGINX_CONFIG_FILENAME } from '../nginx/constants';
import { buildArtifact } from '../pipeline/build-artifact';
import { START_SCRIPT_FILENAME } from '../start-script/constants';

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
const { version } = require('../../package.json');

/**
 * Локальные файлы проекта, замещающие сгенерированные шаблоны, если они лежат в корне проекта.
 * Явно заданные в конфиге `localFiles` имеют приоритет над автодетектом.
 */
function detectLocalFiles(cwd: string): LocalFilesOptions {
    const resolveIfExists = (fileName: string) => {
        const filePath = path.join(cwd, fileName);

        return fs.existsSync(filePath) ? filePath : null;
    };

    return {
        dockerfile: resolveIfExists(DOCKERFILE_FILENAME),
        startScript: resolveIfExists(START_SCRIPT_FILENAME),
        nginxConf: resolveIfExists(NGINX_CONFIG_FILENAME),
        nginxBaseConf: resolveIfExists(BASE_NGINX_CONFIG_FILENAME),
    };
}

(async () => {
    const argv = process.argv.slice(2);
    const cwd = process.cwd();

    const configFile = await resolveConfigFile(cwd, extractConfigPath(argv));

    const program = createCli({
        configFile,
        version,
        run: async ({ command, args }) => {
            const options = resolveCommandOptions(command, configFile);

            if (!options) {
                throw new Error(`Unknown command: ${command}`);
            }

            await buildArtifact({
                ...options,
                localFiles: { ...detectLocalFiles(cwd), ...options.localFiles },
                // аргументы командной строки (name=... version=... registry=...) — высший приоритет
                argv: args,
            });
        },
    });

    await program.parseAsync(argv, { from: 'user' });
})().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
