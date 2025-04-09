import fs from 'fs';
import path from 'path';

import { BuildDcbParams } from './create-dcb-file';

function parseFilename(filename: string) {
    const parsedName = path.parse(filename);
    const [stableName, hash] = parsedName.name.split('.');

    return {
        stableName,
        hash,
        ext: parsedName.ext.substring(1),
        filename,
    };
}

type FilesToCompress = {
    baseDir: string;
    dictionaryDir: string;
    outDir: string;
    allowedExtensions: string[];
}

export async function findFilesToCompress({
    baseDir,
    dictionaryDir,
    outDir,
    allowedExtensions,
}: FilesToCompress) {
    const files = await fs.promises.readdir(baseDir);
    const dictionaries = await fs.promises.readdir(dictionaryDir);

    const parsedDictionaries = dictionaries.reduce(
        (map, current) => {
            const parsed = parseFilename(current);

            return ({
                ...map,
                [`${parsed.stableName}.${parsed.ext}`]: parsed,
            });
        },
        {} as Record<string, ReturnType<typeof parseFilename>>,
    )

    const result: BuildDcbParams[] = [];

    files.forEach((file) => {
        const parsedFilename = parseFilename(file);

        if (!allowedExtensions.includes(parsedFilename.ext)) {
            return;
        }

        if (!parsedFilename.stableName || !parsedFilename.hash) {
            return;
        }

        const matchedDictionary = parsedDictionaries[`${parsedFilename.stableName}.${parsedFilename.ext}`];

        if (!matchedDictionary) {
            return;
        }

        result.push({
            inputFilePath: path.join(baseDir, parsedFilename.filename),
            dictionaryFilePath: path.join(dictionaryDir, matchedDictionary.filename),
            outFilePath: path.join(outDir, `${parsedFilename.filename}.${matchedDictionary.hash}.dcb`),
        });
    });

    return result;
}
