#! /usr/bin/env node
import packageJson from '../package.json';

import { createDcbFile } from './create-dcb-file';
import { findFilesToCompress } from './find-files-to-compress';
import { parseAndValidateOptions } from './parse-and-validate-options';

async function main() {
    const options = await parseAndValidateOptions();

    const result = await findFilesToCompress({
        baseDir: options.input,
        dictionaryDir: options.dictionary,
        outDir: options.output,
        allowedExtensions: options.extensions,
    });

    const promises = result.map(createDcbFile);

    await Promise.all(promises);

    console.log(`${packageJson.name} created ${result.length} files`);
}

main().catch(console.error);
