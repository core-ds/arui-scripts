import { Buffer } from 'buffer';

import { compressWithDcb } from '../compress-with-dcb';

jest.mock('crypto', () => ({
    createHash: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(Buffer.from('mock-hash')),
    })),
}));

jest.mock('brotli-dict', () => ({
    compress: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

describe('createDcbFile', () => {
    const mockDictionaryData = Buffer.from('mock dictionary data');
    const mockInputData = Buffer.from('mock input data');

    it('should create a DCB file with correct format', async () => {
        const res = await compressWithDcb(mockInputData, mockDictionaryData);

        // Verify the written buffer structure
        expect(res).toBeInstanceOf(Buffer);

        // Check header (first 4 bytes)
        expect(res.slice(0, 4)).toEqual(Buffer.from([0xff, 0x44, 0x43, 0x42]));

        // Check hash (next 9 bytes)
        expect(res.slice(4, 13)).toEqual(Buffer.from('mock-hash'));

        // Check compressed data (remaining bytes)
        expect(res.slice(13)).toEqual(Buffer.from([1, 2, 3]));
    });
});
