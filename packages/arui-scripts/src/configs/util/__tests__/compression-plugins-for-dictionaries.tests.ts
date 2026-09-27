import fs from 'fs';

import { configs } from '../../app-configs';
import { compressWithDcb } from '../compress-with-dcb';
import { compressionPluginsForDictionaries } from '../compression-plugins-for-dictionaries';
import { CustomCompressionPlugin } from '../dcb-compression-plugin';

jest.mock('fs', () => ({ readFileSync: jest.fn(), readdirSync: jest.fn() }));
jest.mock('../../app-configs', () => ({
    configs: { compressionPredefinedDictionaryPath: [], compressionPreviousVersionPath: [] },
}));
jest.mock('../compress-with-dcb', () => ({ compressWithDcb: jest.fn() }));
jest.mock('../dcb-compression-plugin', () => ({ CustomCompressionPlugin: jest.fn() }));

describe('dictionary compression selection', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        configs.compressionPredefinedDictionaryPath = [];
        configs.compressionPreviousVersionPath = [];
    });
    test('does not enable compression without dictionaries', () => {
        expect(compressionPluginsForDictionaries()).toEqual([]);
        expect(fs.readFileSync).not.toHaveBeenCalled();
    });
    test('uses a predefined dictionary and names output after it', async () => {
        configs.compressionPredefinedDictionaryPath = ['/dict/shared.bin'];
        const dictionary = Buffer.from('dictionary');

        jest.mocked(fs.readFileSync).mockReturnValue(dictionary);
        const compressed = Buffer.from('compressed');

        jest.mocked(compressWithDcb).mockResolvedValue(compressed);
        expect(compressionPluginsForDictionaries()).toHaveLength(1);
        const options = jest.mocked(CustomCompressionPlugin).mock.calls[0][0];
        const input = Buffer.from('source');

        expect(options.filename({ filename: 'main.123.js' })).toBe('main.123.js.shared.dcb');
        await expect(options.algorithm(input, { filename: 'main.123.js' })).resolves.toBe(
            compressed,
        );
        expect(compressWithDcb).toHaveBeenCalledWith(input, dictionary);
    });
    function previousVersion() {
        configs.compressionPreviousVersionPath = ['/previous'];
        (fs.readdirSync as jest.Mock).mockReturnValue(['main.old.js', 'main.csshash.css']);
        compressionPluginsForDictionaries();

        return jest.mocked(CustomCompressionPlugin).mock.calls[0][0];
    }
    test('matches previous assets by stable name and extension', async () => {
        const options = previousVersion();

        jest.mocked(fs.readFileSync).mockReturnValue(Buffer.from('old JS'));
        jest.mocked(compressWithDcb).mockResolvedValue(Buffer.from('compressed'));
        expect(options.filename({ filename: 'main.new.js' })).toBe('main.new.js.old.dcb');
        expect(options.filename({ filename: 'main.new.css' })).toBe('main.new.css.csshash.dcb');
        await options.algorithm(Buffer.from('new JS'), { filename: 'main.new.js' });
        expect(fs.readFileSync).toHaveBeenCalledWith('/previous/main.old.js', null);
    });
    test('skips assets without a matching dictionary', async () => {
        const options = previousVersion();
        const input = Buffer.from('new chunk');

        expect(options.filename({ filename: 'other.new.js' })).toBe('');
        expect(options.filename({})).toBe('');
        await expect(options.algorithm(input, { filename: 'other.new.js' })).resolves.toBe(input);
        expect(compressWithDcb).not.toHaveBeenCalled();
    });
    test.each(['read', 'compress'])(
        'falls back to uncompressed content on %s failure',
        async (failure) => {
            const options = previousVersion();
            const input = Buffer.from('input');

            if (failure === 'read')
                jest.mocked(fs.readFileSync).mockImplementation(() => {
                    throw new Error('ENOENT');
                });
            else {
                jest.mocked(fs.readFileSync).mockReturnValue(Buffer.from('dictionary'));
                jest.mocked(compressWithDcb).mockRejectedValue(new Error('compression failed'));
            }
            await expect(options.algorithm(input, { filename: 'main.new.js' })).resolves.toBe(
                input,
            );
        },
    );
});
