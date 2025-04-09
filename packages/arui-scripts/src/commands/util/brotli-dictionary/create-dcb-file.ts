import { Buffer } from 'buffer';
import crypto from 'crypto';
import fs from 'fs';

import { compress } from 'brotli-dict';

export type BuildDcbParams = {
    inputFilePath: string;
    dictionaryFilePath: string;
    outFilePath: string;
}

export async function createDcbFile({
    inputFilePath,
    dictionaryFilePath,
    outFilePath,
}: BuildDcbParams) {
    // Формат файла: {Magic Number}{sha256(dictionary)}{compressed data}
    // Подробнее в документации: https://www.ietf.org/archive/id/draft-ietf-httpbis-compression-dictionary-19.html#section-4

    const dictionaryData = await fs.promises.readFile(dictionaryFilePath);
    const inputFile = await fs.promises.readFile(inputFilePath);

    const magicNumberHeader = Buffer.from([0xff, 0x44, 0x43, 0x42]);
    const dictionaryHash = crypto.createHash('sha256').update(dictionaryData).digest();
    const compressedData = await compress(inputFile, {
        dictionary: dictionaryData,
    });

    const outputData = Buffer.concat([
        magicNumberHeader,
        dictionaryHash,
        Buffer.from(compressedData),
    ]);

    await fs.promises.writeFile(outFilePath, outputData);
}
