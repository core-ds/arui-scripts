import fs from 'fs';
import { configs } from '../../../configs/app-configs';
import path from 'path';
import { createDcbFile } from './create-dcb-file';
import { getBundleFiles } from './get-bundle-files';
import { compress } from 'brotli-dict';

export async function dcbFromPredefined() {
    if (!configs.dictionaryCompression.predefinedDictionaryPath) {
        console.warn('predefinedDictionaryPath is not set, but versionDictionaryMode is "predefined"');

        return;
    }

    let dictionaryPath = configs.dictionaryCompression.predefinedDictionaryPath;

    if (!path.isAbsolute(dictionaryPath)) {
        dictionaryPath = path.join(process.cwd(), dictionaryPath);
    }

    const dictionary = await fs.promises.readFile(dictionaryPath, null);
    const compressedDictionary = Buffer.from(await compress(dictionary));
    const bundleFiles = await getBundleFiles();

    const dcbPromises = bundleFiles.map(async (bundleFile) => createDcbFile({
        inputFilePath: bundleFile,
        dictionaryFilePath: dictionaryPath,
        outFilePath: `${bundleFile}.${configs.dictionaryCompression.versionDictionaryName}.dcb`,
    }));

    const resultingDictionaryPath = path.join(
        configs.clientOutputPath,
        `${configs.dictionaryCompression.versionDictionaryName}.bin`,
    );

    await Promise.all([
        ...dcbPromises,
        await fs.promises.writeFile(resultingDictionaryPath, dictionary),
        await fs.promises.writeFile(`${resultingDictionaryPath}.br`, compressedDictionary),
    ]);

    console.log(`Created ${dcbPromises.length} dcb archives`);
}
