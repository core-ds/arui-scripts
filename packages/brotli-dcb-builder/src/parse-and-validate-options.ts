import fs from 'fs';
import path from 'path';

import cliArgs from 'command-line-args';

type CliOptions = {
    input: string;
    output: string;
    dictionary: string;
    extensions: string[];
};

export async function parseAndValidateOptions() {
    const options = cliArgs([
        { name: 'input', alias: 'i', type: String },
        { name: 'dictionary', alias: 'd', type: String },
        { name: 'output', alias: 'o', type: String },
        { name: 'extensions', alias: 'e', type: String, multiple: true, defaultValue: ['js', 'css'] },
    ]) as CliOptions;

    if (!options.input || !options.dictionary || !options.output) {
        console.error(
            'Usage: npx @alfalab/brotli-dcb-builder --input=path/to/directory --dictionary=path/to/dictionaries --output=path/to/output/directory');
        process.exit(1);
    }

    const inputDirectory = ensureAbsolutePath(options.input);
    const isInputDirectoryValid = await isDirectory(inputDirectory);

    if (!isInputDirectoryValid) {
        console.error(`Unable to access input directory "${ inputDirectory }"`);
        process.exit(1);
    }

    const dictionaryDirectory = ensureAbsolutePath(options.dictionary);
    const isDictionaryDirectoryValid = await isDirectory(dictionaryDirectory);

    if (!isDictionaryDirectoryValid) {
        console.error(`Unable to access dictionary directory "${ dictionaryDirectory }"`);
        process.exit(1);
    }

    const outputDirectory = ensureAbsolutePath(options.output);
    const isOutputDirectoryValid = await isDirectory(outputDirectory);

    if (!isOutputDirectoryValid) {
        console.error(`Unable to access output directory "${ outputDirectory }"`);
        process.exit(1);
    }

    return {
        input: inputDirectory,
        dictionary: dictionaryDirectory,
        output: outputDirectory,
        extensions: options.extensions,
    };
}

function ensureAbsolutePath(dir: string): string {
    if (!path.isAbsolute(dir)) {
        return path.join(process.cwd(), dir);
    }

    return dir;
}

async function isDirectory(dir: string) {
    try {
        const stat = await fs.promises.stat(dir);

        return stat.isDirectory();
    } catch (error) {
        return false;
    }
}