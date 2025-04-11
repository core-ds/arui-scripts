import { Buffer } from 'buffer';
import crypto from 'crypto';
import fs from 'fs';

import { compress } from 'brotli-dictionary'

import { BuildDcbParams } from './types';

export async function createDcbFile({
    inputFilePath,
    dictionaryFilePath,
    outFilePath,
}: BuildDcbParams) {
    // формат файла: {заголовок}{sha256(dictionary)}{compressed data}

    const header = Buffer.from([0xff, 0x44, 0x43, 0x42]); // 0x44,0x43,0x42 = 'D','C','B' in ASCII
    const dictionaryData = await fs.promises.readFile(dictionaryFilePath);
    const hash = crypto.createHash('sha256').update(dictionaryData).digest();
    const inputFile = await fs.promises.readFile(inputFilePath);

    const res = compress(inputFile, {
        dictionary: dictionaryData,
    });

    const outputData = Buffer.concat([header, hash, Buffer.from(res)]);

    await fs.promises.writeFile(outFilePath, outputData);
}