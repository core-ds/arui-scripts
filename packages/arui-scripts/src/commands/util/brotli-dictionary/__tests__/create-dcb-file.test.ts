import { Buffer } from 'buffer';
import crypto from 'crypto';
import fs from 'fs';

import { compress } from 'brotli-dict';

import { createDcbFile } from '../create-dcb-file';

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
    },
}));

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
    const mockParams = {
        inputFilePath: 'input.txt',
        dictionaryFilePath: 'dictionary.txt',
        outFilePath: 'output.dcb',
    };

    const mockDictionaryData = Buffer.from('mock dictionary data');
    const mockInputData = Buffer.from('mock input data');

    beforeEach(() => {
        jest.clearAllMocks();
        const mockReadFile = fs.promises.readFile as jest.Mock;

        mockReadFile.mockImplementation((path: string) => {
            if (path === mockParams.dictionaryFilePath) {
                return Promise.resolve(mockDictionaryData);
            }
            if (path === mockParams.inputFilePath) {
                return Promise.resolve(mockInputData);
            }

            return Promise.reject(new Error('File not found'));
        });
    });

    it('should create a DCB file with correct format', async () => {
        await createDcbFile(mockParams);

        // Verify file reads
        expect(fs.promises.readFile).toHaveBeenCalledWith(mockParams.dictionaryFilePath);
        expect(fs.promises.readFile).toHaveBeenCalledWith(mockParams.inputFilePath);

        // Verify hash calculation
        expect(crypto.createHash).toHaveBeenCalledWith('sha256');

        // Verify compression
        expect(compress).toHaveBeenCalledWith(mockInputData, {
            dictionary: mockDictionaryData,
        });

        // Verify file write
        expect(fs.promises.writeFile).toHaveBeenCalledWith(
            mockParams.outFilePath,
            expect.any(Buffer)
        );

        // Verify the written buffer structure
        const writtenBuffer = (fs.promises.writeFile as jest.Mock).mock.calls[0][1];

        expect(writtenBuffer).toBeInstanceOf(Buffer);

        // Check header (first 4 bytes)
        expect(writtenBuffer.slice(0, 4)).toEqual(Buffer.from([0xff, 0x44, 0x43, 0x42]));

        // Check hash (next 9 bytes)
        expect(writtenBuffer.slice(4, 13)).toEqual(Buffer.from('mock-hash'));

        // Check compressed data (remaining bytes)
        expect(writtenBuffer.slice(13)).toEqual(Buffer.from([1, 2, 3]));
    });

    it('should handle file read errors', async () => {
        const error = new Error('File read error');

        (fs.promises.readFile as jest.Mock).mockRejectedValue(error);

        await expect(createDcbFile(mockParams)).rejects.toThrow('File read error');
    });

    it('should handle file write errors', async () => {
        const error = new Error('File write error');

        (fs.promises.writeFile as jest.Mock).mockRejectedValue(error);

        await expect(createDcbFile(mockParams)).rejects.toThrow('File write error');
    });
});
