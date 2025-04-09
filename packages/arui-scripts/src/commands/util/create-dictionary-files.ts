import path from 'path';

import { configs } from '../../configs/app-configs';

import { createDcbFile } from './brotli-dictionary/create-dcb-file';
import { findFilesToCompress } from './brotli-dictionary/find-files-to-compress';
import { getBundleFiles } from './brotli-dictionary/get-bundle-files';

export async function createDictionaryFiles() {
    const previousVersionPath = configs.compressionPreviousVersionPath;
    const singleFilesDictionaries = configs.compressionPredefinedDictionaryPath;

    if (previousVersionPath.length > 0) {
        const filesToCompressPromise = previousVersionPath.map((dictionaryDir) => findFilesToCompress({
            baseDir: configs.clientOutputPath,
            outDir: configs.clientOutputPath,
            allowedExtensions: ['js', 'css'],
            dictionaryDir,
        }));

        const filesToCompress = (await Promise.all(filesToCompressPromise)).flat();

        const dcbPromises = filesToCompress.map((fileSettings) => createDcbFile(fileSettings));

        await Promise.all(dcbPromises);

        console.log(`Created ${filesToCompress.length} dcb archives from previous versions`);

        return;
    }

    if (singleFilesDictionaries.length > 0) {
        const bundleFiles = await getBundleFiles();

        const singleFilePromises = singleFilesDictionaries.map(async (dictionaryPath) => {
            const dictionaryName = path.parse(dictionaryPath).name;

            const dcbPromises = bundleFiles.map(async (bundleFile) => createDcbFile({
                inputFilePath: bundleFile,
                dictionaryFilePath: dictionaryPath,
                outFilePath: `${bundleFile}.${dictionaryName}.dcb`,
            }));

            await Promise.all(dcbPromises);

            console.log(`Created ${dcbPromises.length} dcb archives for ${dictionaryName} dictionary`);
        });

        await Promise.all(singleFilePromises);
    }
}
