import fs from 'fs';
import path from 'path';

import chalk from 'chalk';

import configs from '../../configs/app-configs';

const extensions = ['ts', 'tsx', 'js', 'jsx'];

function entryPointToArray(
    entryPoint: string | string[] | Record<string, string | string[]>,
): string[] {
    if (typeof entryPoint === 'string') {
        return [entryPoint];
    }
    if (Array.isArray(entryPoint)) {
        return entryPoint;
    }

    return Object.keys(entryPoint).reduce((result, name) => {
        const entry = entryPointToArray(entryPoint[name]);

        return [...result, ...entry];
    }, [] as string[]);
}

const files = [
    ...entryPointToArray(configs.serverEntry),
    ...entryPointToArray(configs.clientEntry),
    ...(Array.isArray(configs.clientPolyfillsEntry)
        ? configs.clientPolyfillsEntry
        : [configs.clientPolyfillsEntry]),
];

function checkFileWithExtensions(filePath: string, extensions: string[]) {
    if (extensions.some((ext) => filePath.endsWith(`.${ext}`))) {
        try {
            fs.accessSync(filePath);

            return true;
        } catch (err) {
            // empty error
        }
    }

    for (let i = 0; i < extensions.length; i++) {
        try {
            fs.accessSync(`${filePath}.${extensions[i]}`);

            return true;
        } catch (err) {
            // emprty error
        }
    }

    return false;
}

function checkRequiredFiles() {
    const unavailableFilePaths: string[] = files.filter(Boolean).reduce((result, filePath) => {
        if (filePath && !checkFileWithExtensions(filePath, extensions)) {
            result.push(filePath);
        }

        return result;
    }, [] as string[]);

    if (unavailableFilePaths.length !== 0) {
        console.log(chalk.red('Could not find required files.'));
        const extensionsString = extensions.join(',');

        unavailableFilePaths.forEach((filePath) => {
            const dirName = path.dirname(filePath);
            const fileName = path.basename(filePath);

            console.log(chalk.red('  Name: ') + chalk.cyan(`${fileName}.{${extensionsString}}`));
            console.log(chalk.red('  Searched in: ') + chalk.cyan(dirName));
        });

        return false;
    }

    return true;
}

export default checkRequiredFiles;
