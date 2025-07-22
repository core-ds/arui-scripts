import fs from 'fs';
import path from 'path';

import { findFilesToCompress } from '../find-files-to-compress';

const mockReaddir = fs.promises.readdir as jest.Mock;

jest.mock('fs', () => ({
    promises: {
        readdir: jest.fn(),
    },
}));

describe('findFilesToCompress', () => {
    const mockBaseDir = '/base/dir';
    const mockDictionaryDir = '/dictionary/dir';
    const mockOutDir = '/out/dir';
    const mockAllowedExtensions = ['js', 'css'];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return empty array when no matching files are found', async () => {
        mockReaddir.mockImplementation((dir) => {
            if (dir === mockBaseDir) {
                return Promise.resolve(['file1.txt', 'file2.pdf']);
            }
            if (dir === mockDictionaryDir) {
                return Promise.resolve(['dict1.js.abc123']);
            }

            return Promise.resolve([]);
        });

        const result = await findFilesToCompress({
            baseDir: mockBaseDir,
            dictionaryDir: mockDictionaryDir,
            outDir: mockOutDir,
            allowedExtensions: mockAllowedExtensions,
        });

        expect(result).toHaveLength(0);
    });

    it('should correctly match files with dictionaries and generate output paths', async () => {
        mockReaddir.mockImplementation((dir) => {
            if (dir === mockBaseDir) {
                return Promise.resolve(['component.abc123.js']);
            }
            if (dir === mockDictionaryDir) {
                return Promise.resolve(['component.xyz789.js']);
            }

            return Promise.resolve([]);
        });

        const result = await findFilesToCompress({
            baseDir: mockBaseDir,
            dictionaryDir: mockDictionaryDir,
            outDir: mockOutDir,
            allowedExtensions: mockAllowedExtensions,
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            inputFilePath: path.join(mockBaseDir, 'component.abc123.js'),
            dictionaryFilePath: path.join(mockDictionaryDir, 'component.xyz789.js'),
            outFilePath: path.join(mockOutDir, 'component.abc123.js.xyz789.dcb'),
        });
    });

    it('should handle multiple matching files', async () => {
        mockReaddir.mockImplementation((dir) => {
            if (dir === mockBaseDir) {
                return Promise.resolve(['component1.abc123.js', 'component2.def456.css']);
            }
            if (dir === mockDictionaryDir) {
                return Promise.resolve(['component1.xyz789.js', 'component2.uvw321.css']);
            }

            return Promise.resolve([]);
        });

        const result = await findFilesToCompress({
            baseDir: mockBaseDir,
            dictionaryDir: mockDictionaryDir,
            outDir: mockOutDir,
            allowedExtensions: mockAllowedExtensions,
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            inputFilePath: path.join(mockBaseDir, 'component1.abc123.js'),
            dictionaryFilePath: path.join(mockDictionaryDir, 'component1.xyz789.js'),
            outFilePath: path.join(mockOutDir, 'component1.abc123.js.xyz789.dcb'),
        });
        expect(result[1]).toEqual({
            inputFilePath: path.join(mockBaseDir, 'component2.def456.css'),
            dictionaryFilePath: path.join(mockDictionaryDir, 'component2.uvw321.css'),
            outFilePath: path.join(mockOutDir, 'component2.def456.css.uvw321.dcb'),
        });
    });

    it('should skip files with invalid format', async () => {
        mockReaddir.mockImplementation((dir) => {
            if (dir === mockBaseDir) {
                return Promise.resolve(['invalid.js', 'component.abc123.js']);
            }
            if (dir === mockDictionaryDir) {
                return Promise.resolve(['component.xyz789.js']);
            }

            return Promise.resolve([]);
        });

        const result = await findFilesToCompress({
            baseDir: mockBaseDir,
            dictionaryDir: mockDictionaryDir,
            outDir: mockOutDir,
            allowedExtensions: mockAllowedExtensions,
        });

        expect(result).toHaveLength(1);
        expect(result[0].outFilePath).toContain('component.abc123.js.xyz789.dcb');
    });

    it('should skip files with non-allowed extensions', async () => {
        mockReaddir.mockImplementation((dir) => {
            if (dir === mockBaseDir) {
                return Promise.resolve(['component.abc123.txt', 'component.def456.js']);
            }
            if (dir === mockDictionaryDir) {
                return Promise.resolve(['component.xyz789.txt', 'component.uvw321.js']);
            }

            return Promise.resolve([]);
        });

        const result = await findFilesToCompress({
            baseDir: mockBaseDir,
            dictionaryDir: mockDictionaryDir,
            outDir: mockOutDir,
            allowedExtensions: mockAllowedExtensions,
        });

        expect(result).toHaveLength(1);
        expect(result[0].outFilePath).toContain('component.def456.js.uvw321.dcb');
    });
});