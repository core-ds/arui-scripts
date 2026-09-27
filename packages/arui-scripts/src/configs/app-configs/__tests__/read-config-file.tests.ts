import fs from 'fs';
import os from 'os';
import path from 'path';

import { getConfigFilePath, readConfigFile } from '../read-config-file';
import { type AppConfigs, type AppContext } from '../types';
import { updateWithConfigFile } from '../update-with-config-file';

describe('project config loading', () => {
    let cwd: string;

    beforeEach(() => {
        cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-config-test-'));
    });
    afterEach(() => {
        fs.rmSync(cwd, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    test('missing file leaves configuration unchanged', () => {
        const config = { serverPort: 3000 } as AppConfigs;

        expect(getConfigFilePath(cwd)).toBeUndefined();
        expect(readConfigFile(cwd)).toBeNull();
        expect(updateWithConfigFile(config, { cwd } as AppContext)).toBe(config);
    });

    test.each([
        'module.exports = { serverPort: 4000 };',
        'module.exports = { __esModule: true, default: { serverPort: 4000 } };',
    ])('loads CommonJS and transpiled default exports: %s', (source) => {
        const filename = path.join(cwd, 'arui-scripts.config.js');

        fs.writeFileSync(filename, source);
        expect(getConfigFilePath(cwd)).toBe(fs.realpathSync(filename));
        expect(readConfigFile(cwd)).toEqual({ serverPort: 4000 });
    });

    test('merges nested settings without losing defaults and warns on unknown keys', () => {
        fs.writeFileSync(
            path.join(cwd, 'arui-scripts.config.js'),
            'module.exports = { dictionaryCompression: { enablePreviousVersionHeaders: true }, typo: 1 };',
        );
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const config = {
            dictionaryCompression: {
                dictionaryPath: ['dictionary'],
                enablePreviousVersionHeaders: false,
            },
        } as AppConfigs;
        const result = updateWithConfigFile(config, { cwd } as AppContext);

        expect(result.dictionaryCompression).toEqual({
            dictionaryPath: ['dictionary'],
            enablePreviousVersionHeaders: true,
        });
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('typo'));
    });

    test('does not hide errors thrown while loading config', () => {
        fs.writeFileSync(
            path.join(cwd, 'arui-scripts.config.js'),
            'throw new Error("broken config");',
        );
        expect(() => readConfigFile(cwd)).toThrow('broken config');
    });
});
