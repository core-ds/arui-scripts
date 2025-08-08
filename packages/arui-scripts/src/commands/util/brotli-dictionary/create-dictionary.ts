import fs from 'fs';

import { compress, generateDictionary } from 'brotli-dict';

type CreateDictionaryParams = {
    inputFiles: string[];
    outputPath: string;
    sizeLimit: number;
};

export async function createDictionary({
    inputFiles,
    outputPath,
    sizeLimit
}: CreateDictionaryParams) {
    const data = await Promise.all(inputFiles.map((filePath) => fs.promises.readFile(filePath, null)));

    const dictionary = Buffer.from(await generateDictionary({
        data,
        dictionarySizeLimit: sizeLimit,
    }));
    const compressedDictionary = await compress(dictionary);

    await Promise.all([
        fs.promises.writeFile(outputPath, dictionary, null),
        fs.promises.writeFile(`${outputPath}.br`, compressedDictionary, null),
    ]);

    return outputPath;
}
