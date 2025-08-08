import path from 'path';

import { configs } from '../../../configs/app-configs';

import { createDcbFile } from './create-dcb-file';
import { createDictionary } from './create-dictionary';
import { getBundleFiles } from './get-bundle-files';

export async function dcbFromBundle() {
    const dictionaryPath = path.join(
        configs.clientOutputPath,
        `${configs.dictionaryCompression.versionDictionaryName}.bin`,
    );
    const bundleFiles = await getBundleFiles();

    await createDictionary({
        inputFiles: bundleFiles,
        outputPath: dictionaryPath,
        sizeLimit: configs.dictionaryCompression.dictionarySize,
    });

    const dcbPromises = bundleFiles.map(async (bundleFile) => createDcbFile({
        inputFilePath: bundleFile,
        dictionaryFilePath: dictionaryPath,
        outFilePath: `${bundleFile}.${configs.dictionaryCompression.versionDictionaryName}.dcb`,
    }));

    await Promise.all(dcbPromises);

    console.log(`Created ${dcbPromises.length} dcb archives`);
}
