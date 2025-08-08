import { configs } from '../../../configs/app-configs';

import { createDcbFile } from './create-dcb-file';
import { findFilesToCompress } from './find-files-to-compress';

export async function dcbFromPreviousVersion() {
    if (!configs.dictionaryCompression.previousVersionPath) {
        return;
    }

    const previousVersions = Array.isArray(configs.dictionaryCompression.previousVersionPath)
        ? configs.dictionaryCompression.previousVersionPath
        : [configs.dictionaryCompression.previousVersionPath];

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
