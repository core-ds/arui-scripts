import { createDcbFile, findFilesToCompress } from '@alfalab/brotli-dcb-builder';

import { configs } from '../../configs/app-configs';

export async function createDcbFiles() {
    if (!configs.previousVersionPath) {
        return;
    }

    const previousVersions = Array.isArray(configs.previousVersionPath)
        ? configs.previousVersionPath
        : [configs.previousVersionPath];

    const filesToCompressPromise = previousVersions.map((dictionaryDir) => findFilesToCompress({
        baseDir: configs.clientOutputPath,
        outDir: configs.clientOutputPath,
        allowedExtensions: ['js', 'css'],
        dictionaryDir,
    }));

    const filesToCompress = (await Promise.all(filesToCompressPromise)).flat();

    const dcbPromises = filesToCompress.map((fileSettings) => createDcbFile(fileSettings));

    await Promise.all(dcbPromises);

    console.log(`Created ${filesToCompress.length} dcb archives`);
}
