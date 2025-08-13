import { Buffer } from 'buffer';
import crypto from 'crypto';

import { compress } from 'brotli-dict';

export async function compressWithDcb(inputFile: Buffer, dictionaryData: Buffer) {
    const magicNumberHeader = Buffer.from([0xff, 0x44, 0x43, 0x42]);
    const dictionaryHash = crypto.createHash('sha256').update(dictionaryData).digest();
    const compressedData = await compress(inputFile, {
        dictionary: dictionaryData,
    });

    return Buffer.concat([
        magicNumberHeader,
        dictionaryHash,
        Buffer.from(compressedData),
    ]);
}
