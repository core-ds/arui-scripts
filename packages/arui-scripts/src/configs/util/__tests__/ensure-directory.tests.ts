import fs from 'fs';

import { ensureDirectory } from '../ensure-directory';

jest.mock('fs');

describe('ensureDirectory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fs.existsSync as jest.Mock).mockClear();
        (fs.mkdirSync as jest.Mock).mockClear();
    });

    it('should create directory if it does not exist', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        ensureDirectory('/test/path');

        expect(fs.existsSync).toHaveBeenCalledTimes(2);
        expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
        expect(fs.mkdirSync).toHaveBeenCalledWith('/test');
        expect(fs.mkdirSync).toHaveBeenCalledWith('/test/path');
    });

    it('should not create directory if it already exists', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);

        ensureDirectory('/existing/path');

        expect(fs.existsSync).toHaveBeenCalledTimes(2);
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should handle paths with multiple levels', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        ensureDirectory('/a/b/c/d');

        expect(fs.existsSync).toHaveBeenCalledTimes(4);
        expect(fs.mkdirSync).toHaveBeenCalledTimes(4);
        expect(fs.mkdirSync).toHaveBeenCalledWith('/a');
        expect(fs.mkdirSync).toHaveBeenCalledWith('/a/b');
        expect(fs.mkdirSync).toHaveBeenCalledWith('/a/b/c');
        expect(fs.mkdirSync).toHaveBeenCalledWith('/a/b/c/d');
    });
});
